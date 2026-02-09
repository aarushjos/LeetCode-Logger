const SHEETS_API = "https://sheets.googleapis.com/v4/spreadsheets";
let notifiedProblems = new Set();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "PROBLEM_SOLVED") {
    handleProblemSolved(message.data);
  }
});

function getBaseProblemUrl(url) {
  const match = url.match(/(https:\/\/leetcode\.com\/problems\/[^\/]+)/);
  return match ? match[1] : url;
}

async function handleProblemSolved(problemData) {
  try {
    const { spreadsheetId, autoLog } = await chrome.storage.local.get([
      "spreadsheetId",
      "autoLog",
    ]);

    if (!spreadsheetId) {
      console.log("No spreadsheet configed");
      return;
    }
    if (autoLog === false) {
      console.log("Auto logging disabled adding problem as pending");
      await chrome.storage.local.set({ pendingProblem: problemData });

      //show badge noti
      chrome.action.setBadgeText({ text: "1" });
      chrome.action.setBadgeBackgroundColor({ color: "#10b981" });

      showNoti("Problem Solved!", "Open extension to add note and log");

      return;
    }
    const isDup = await isDuplicate(spreadsheetId, problemData.url);
    const baseUrl = getBaseProblemUrl(problemData.url);
    if (isDup) {
      console.log("Problem already logged");
      if (!notifiedProblems.has(baseUrl)) {
        notifiedProblems.add(baseUrl);
        showNoti(
          "Already Logged",
          `${problemData.problemName} is already in your sheet`,
        );
      } else {
        console.log(
          "Already notified user about this duplicate, skipping notification",
        );
      }
      return;
    }

    await logToSheet(spreadsheetId, problemData);
    showNoti("Logged!", `${problemData.problemName} logged to Google Sheets`);
  } catch (error) {
    console.log("logging problem error: ", error);
    showNoti("Error", "Failed to log problem. Check extension popup.");
  }
}

async function logProblemWithNote(data) {
  try {
    const { spreadsheetId } = await chrome.storage.local.get("spreadsheetId");

    if (!spreadsheetId) {
      throw new Error("No spreadsheet configed");
    }

    const isDup = await isDuplicate(spreadsheetId, data.url);
    if (isDup) {
      showNoti("Already logged", `${data.problemName} is already in ur sheet`);
      return;
    }

    await logToSheet(spreadsheetId, data);

    //clear pending
    await chrome.storage.local.remove("pendingProblem");
    chrome.action.setBadgeText({ text: "" });

    console.log("Successfully logged(manual)");
    showNoti("Logged", `${data.problemName} logged success`);
  } catch (error) {
    console.error("error logging: ", error);
    throw error;
  }
}

async function logToSheet(spreadsheetId, data) {
  const token = await getAuthToken();
  const normalizedUrl = getBaseProblemUrl(data.url);

  const values = [
    [
      new Date().toLocaleDateString(),
      new Date().toLocaleTimeString(),
      data.problemName,
      data.topic,
      data.difficulty,
      normalizedUrl,
      data.note || "",
    ],
  ];
  const response = await fetch(
    `${SHEETS_API}/${spreadsheetId}/values/Sheet1!A:G:append?valueInputOption=RAW`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ values }),
    },
  );

  if (!response.ok) {
    throw new Error("Failed to append to sheet");
  }

  return response.json();
}

async function getAuthToken() {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive: false }, (token) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(token);
      }
    });
  });
}

async function isDuplicate(spreadsheetId, url) {
  try {
    if (!spreadsheetId) return false;

    const token = await getAuthToken();

    const response = await fetch(
      `${SHEETS_API}/${spreadsheetId}/values/Sheet1!F:F`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    const links = data.values ? data.values.flat() : [];
    const baseUrl = getBaseProblemUrl(url);

    const isDup = links.some((existingLink) => {
      const existingBaseUrl = getBaseProblemUrl(existingLink);
      return existingBaseUrl === baseUrl;
    });

    return isDup;
  } catch (error) {
    console.error("Error checking dups", error);
    return false;
  }
}

function showNoti(title, message) {
  console.log("Trying noti", title, message);
  try {
    chrome.notifications.create(
      {
        type: "basic",
        iconUrl: "icon48.png",
        title: title,
        message: message,
      },
      (notificationId) => {
        if (chrome.runtime.lastError) {
          console.error("Noti error: ", chrome.runtime.lastError);
        } else {
          console.log("Noti created with ID: ", notificationId);
        }
      },
    );
  } catch (error) {
    console.error("Error creating noti: ", error);
  }
}
