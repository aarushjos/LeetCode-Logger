const SHEETS_API = "https://sheets.googleapis.com/v4/spreadsheets";

document.addEventListener("DOMContentLoaded", async () => {
  console.log("Popup loaded");
  await checkConnection();
  setupEventListeners();
});

function setupEventListeners() {
  document.getElementById("authButton").addEventListener("click", authenticate);
  document
    .getElementById("saveSheet")
    .addEventListener("click", saveSpreadsheetId);
  document
    .getElementById("createNew")
    .addEventListener("click", createNewSheet);
  document
    .getElementById("autoLogToggle")
    .addEventListener("click", toggleAutoLog);
  document.getElementById("openSheet").addEventListener("click", openSheet);
  document.getElementById("signOut").addEventListener("click", signOut);
  document.getElementById("helpLink").addEventListener("click", showHelp);

  const logBtn = document.getElementById("logBtn");
  const denyBtn = document.getElementById("denyBtn");
  if (logBtn) logBtn.addEventListener("click", logPendingProblem);
  if (denyBtn) denyBtn.addEventListener("click", denyPendingProblem);
}

async function checkConnection() {
  const {
    spreadsheetId,
    autoLog = true,
    isAuthenticated,
  } = await chrome.storage.local.get([
    "spreadsheetId",
    "autoLog",
    "isAuthenticated",
  ]);
  if (isAuthenticated) {
    try {
      const token = await getAuthToken();
      if (token) {
        console.log("Already authenticated with valid token");

        //check if spreadsheet
        if (spreadsheetId) {
          console.log("Already connected to sheet", spreadsheetId);
          showConnected();
          document.getElementById("autoLogToggle").checked = autoLog;

          await checkPendingProblem();
          return;
        } else {
          console.log("Authenticated but no sheet configured");
          showSetupAfterAuth();
          return;
        }
      }
    } catch (error) {
      console.log("Token expired of invalid");
      await chrome.storage.local.remove("isAuthenticated");
    }
  }
  console.log("Not authed");
  showSignIn();
}

async function checkPendingProblem() {
  const { pendingProblem } = await chrome.storage.local.get("pendingProblem");

  if (pendingProblem) {
    console.log("Found pending problem:", pendingProblem);
    showPendingProblem(pendingProblem);
  } else {
    hidePendingProblem();
  }
}

function showPendingProblem(problemData) {
  const pendingSection = document.getElementById("pendingSection");
  if (!pendingSection) {
    console.error("pending sec not found");
    return;
  }
  pendingSection.classList.remove("hidden");

  document.getElementById("pendingProblemName").textContent =
    problemData.problemName;

  const difficulty = document.getElementById("pendingDifficulty");
  difficulty.textContent = problemData.difficulty;
  difficulty.className = `difficulty-badge ${problemData.difficulty.toLowerCase()}`;
  window.currentPendingProblem = problemData;
}

function hidePendingProblem() {
  const pendingSection = document.getElementById("pendingSection");
  if (pendingSection) {
    pendingSection.classList.add("hidden");
  }

  const noteInput = document.getElementById("noteInput");
  if (noteInput) {
    noteInput.value = "";
  }

  window.currentPendingProblem = null;
}

async function logPendingProblem() {
  if (!window.currentPendingProblem) {
    alert("No pending problem found");
    return;
  }

  const noteInput = document.getElementById("noteInput");
  const note = noteInput ? noteInput.value.trim() : "";

  const problemData = { ...window.currentPendingProblem, note: note };

  try {
    console.log("Logging pending prob with note: ", note);

    const { spreadsheetId } = await chrome.storage.local.get("spreadsheetId");
    if (!spreadsheetId) {
      alert("No spreadsheet configured");
      return;
    }

    const token = await getAuthToken();

    //check dup
    const dupCheck = await isDuplicate(spreadsheetId, problemData.url);
    if (dupCheck) {
      alert("Problem is already logged in your sheet");
      hidePendingProblem();
      await chrome.storage.local.remove("pendingProblem");
      chrome.action.setBadgeText({ text: "" });
      return;
    }

    const values = [
      [
        new Date().toLocaleDateString(),
        new Date().toLocaleTimeString(),
        problemData.problemName,
        problemData.topic || "Unknown",
        problemData.difficulty,
        problemData.url,
        note,
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
      throw new Error("Failed to log to sheet");
    }

    //Clear pending
    await chrome.storage.local.remove("pendingProblem");
    chrome.action.setBadgeText({ text: "" });

    hidePendingProblem();
    alert("Problem logged successfully!");
  } catch (error) {
    console.error("Error logging: ", error);
    alert("Error: " + error.message);
  }
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

    const isDup = links.includes(url);

    return isDup;
  } catch (error) {
    console.error("Error checking dups", error);
    return false;
  }
}

async function denyPendingProblem() {
  if (confirm("Are u sure u want to log this problem?")) {
    await chrome.storage.local.remove("pendingProblem");
    chrome.action.setBadgeText({ text: "" });
    hidePendingProblem();
    console.log("Pending prob denied");
  }
}

async function toggleAutoLog(e) {
  const enabled = e.target.checked;
  await chrome.storage.local.set({ autoLog: enabled });
  console.log("Auto-logging:", enabled ? "enabled" : "disabled");

  // If turning on auto-log, clear pending
  if (enabled) {
    await chrome.storage.local.remove("pendingProblem");
    chrome.action.setBadgeText({ text: "" });
    hidePendingProblem();
  }
}

async function authenticate() {
  try {
    console.log("Trying auth");
    const authBtn = document.getElementById("authButton");
    authBtn.disabled = true;
    authBtn.innerHTML =
      '<i class="fas fa-spinner fa-spin"></i> Authenticating...';

    //request OAuth token from google
    const token = await new Promise((resolve, reject) => {
      chrome.identity.getAuthToken({ interactive: true }, (token) => {
        if (chrome.runtime.lastError) {
          console.error("Auth error: ", chrome.runtime.lastError);
          reject(chrome.runtime.lastError);
        } else {
          console.log("Auth success");
          resolve(token);
        }
      });
    });

    //save auth state
    await chrome.storage.local.set({ isAuthenticated: true });

    //show sheet setup options
    showSetupAfterAuth();
  } catch (error) {
    console.error("Authentication failed: ", error);

    const authBtn = document.getElementById("authButton");
    authBtn.disabled = false;
    authBtn.innerHTML = authBtn.innerHTML =
      '<i class="fab fa-google"></i> Sign in with Google';

    alert(
      "Auth failed\n\n" +
        "Error:" +
        error.message +
        "\n\n" +
        "Make sure you have:\n" +
        "1. Created OAuth credentials in Google Cloud Console\n" +
        "2. Added Client ID to manifest.json\n" +
        "3. Enabled Google Sheets API\n" +
        "4. Reloaded the extension after making changes",
    );
  }
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

function showSignIn() {
  document.getElementById("authButton").classList.remove("hidden");
  document.getElementById("authButton").style.display = "flex";

  document.getElementById("sheetSetup").classList.add("hidden");
  document.getElementById("connectedSection").classList.add("hidden");

  // Reset button
  const authBtn = document.getElementById("authButton");
  authBtn.innerHTML =
    '<img src="./google-logo.svg" class="google-logo" /><span>Sign in with Google</span>';
  authBtn.disabled = false;
  authBtn.className = "btn btn-primary google-btn";
}

function showSetupAfterAuth() {
  //remove sign in button
  document.getElementById("authButton").classList.add("hidden");
  document.getElementById("authButton").style.display = "none";

  //display sheet setup
  document.getElementById("sheetSetup").classList.remove("hidden");

  //remove onnected section
  document.getElementById("connectedSection").classList.add("hidden");
}

function showConnected() {
  //remove sign in and setup
  document.getElementById("authButton").classList.add("hidden");
  document.getElementById("authButton").style.display = "none";
  document.getElementById("sheetSetup").classList.add("hidden");

  //connected section
  document.getElementById("connectedSection").classList.remove("hidden");
}

async function saveSpreadsheetId() {
  const spreadsheetId = document.getElementById("spreadsheetId").value.trim();

  if (!spreadsheetId) {
    alert('Please enter a Spreadsheet ID or click "Create New Sheet"');
    return;
  }

  try {
    console.log("Verifying sheet access");

    //check if sheet exists

    const saveBtn = document.getElementById("saveSheet");
    saveBtn.disabled = true;
    saveBtn.innerHTML =
      '<i class="fas fa-spinner fa-spin"></i> Verifying Access to Sheet...';
    const token = await getAuthToken();
    const response = await fetch(`${SHEETS_API}/${spreadsheetId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error(
        "Cannot access spreadsheet. Check the ID and make sure the sheet is shared with your Google account.",
      );
    }

    //save to storage
    await chrome.storage.local.set({ spreadsheetId, autoLog: true });
    await initSheet(spreadsheetId);

    console.log("Sheet connected: ", spreadsheetId);
    showConnected();
    alert("Sheet connected!");
  } catch (error) {
    console.error("Error saving sheet: ", error);
    alert("Error: " + error.message);
  }
}

async function createNewSheet() {
  try {
    const createBtn = document.getElementById("createNew");
    createBtn.disabled = true;
    createBtn.innerHTML =
      '<i class="fas fa-spinner fa-spin"></i>  Creating Sheet...';
    console.log("creating new Google Sheet");

    const token = await getAuthToken();
    //response has 3 methods response.ok, response.status,response.json (json contains the data recieved back by google)
    const response = await fetch(SHEETS_API, {
      method: "POST", //POST->write to the sheet,PUT->update sheet,GET->read sheet,DELETE->delete stuff
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        properties: {
          title: "LeetCode Progress - " + new Date().toLocaleDateString(),
        },
        sheets: [
          {
            properties: {
              title: "Sheet1",
              gridProperties: {
                frozenRowCount: 1,
              },
            },
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Failed to create sheet");
    }

    const data = await response.json();
    const spreadsheetId = data.spreadsheetId;

    console.log("Sheet created: ", spreadsheetId);

    //save and init
    await chrome.storage.local.set({ spreadsheetId, autoLog: true });
    await initSheet(spreadsheetId);

    showConnected();
    alert(
      "New sheet created!\n\nSheet ID: " +
        spreadsheetId +
        '\n\nClick "Open Sheet" to view it.',
    );
  } catch (error) {
    console.error("Error creating sheet: ", error);
    alert("Error creating sheet: " + error.message);
  }
}

async function initSheet(spreadsheetId) {
  try {
    const token = await getAuthToken();
    console.log("Adding headers to sheet");
    //add headers

    await fetch(
      `${SHEETS_API}/${spreadsheetId}/values/Sheet1!A1:G1?valueInputOption=RAW`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          values: [
            [
              "Date",
              "Time",
              "Problem Name",
              "Topic",
              "Difficulty",
              "Link",
              "Notes",
            ],
          ],
        }),
      },
    );

    //format the text (bold and bg color)
    await fetch(`${SHEETS_API}/${spreadsheetId}:batchUpdate`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        requests: [
          {
            repeatCell: {
              range: {
                sheetId: 0,
                startRowIndex: 0,
                endRowIndex: 1,
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.2, green: 0.2, blue: 0.2 },
                  textFormat: {
                    foregroundColor: { red: 1, green: 1, blue: 1 },
                    bold: true,
                  },
                },
              },
              fields: "userEnteredFormat(backgroundColor,textFormat)",
            },
          },
        ],
      }),
    });

    console.log("Sheet inited");
  } catch (error) {
    console.error("Error initing sheet: ", error);
  }
}

async function openSheet() {
  const { spreadsheetId } = await chrome.storage.local.get("spreadsheetId");
  if (spreadsheetId) {
    window.open(`https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`);
  }
}

async function signOut() {
  try {
    console.log("Signing out");

    const token = await new Promise((resolve) => {
      chrome.identity.getAuthToken({ interactive: false }, (token) => {
        resolve(token);
      });
    });

    if (token) {
      await new Promise((resolve) => {
        chrome.identity.removeCachedAuthToken({ token }, resolve);
      });
    }

    await chrome.storage.local.remove([
      "isAuthenticated",
      "spreadsheetId",
      "autoLog",
    ]);

    showSignIn();

    console.log("Signed out successfully");
    alert("Signed out successfully");
  } catch (error) {
    console.error("Sign out failed:", error);
    alert("Error signing out");
  }
}

function showHelp(e) {
  e.preventDefault();
  alert(
    "How to get your Spreadsheet ID:\n" +
      "1. Open your Google Sheet\n" +
      "2. Look at the URL in your browser\n" +
      "3. Copy the long string between /d/ and /edit\n\n" +
      "Example URL:\n" +
      "https://docs.google.com/spreadsheets/d/COPY_THIS_PART/edit\n\n" +
      "Tip: Just click 'Create New Sheet' to skip this step!",
  );
}
