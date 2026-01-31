let lastCheckedSub = null;

function getProblemInfo() {
  //Problem name
  const titleElement = document.querySelector("title"); //title tag containing the problem name in the format name - LeetCode so replace leetcode
  const problemName = titleElement
    ? titleElement.textContent.replace(" - LeetCode", "").trim()
    : "Unknown";

  //Difficulty
  const difficultyElement = document.querySelector(
    '[class*="text-difficulty"]',
  );
  const difficulty = difficultyElement
    ? difficultyElement.textContent.trim()
    : "Unknown";

  //Topic
  const topicElement = document.querySelector('a[href^="/tag/"]');
  const topic = topicElement ? topicElement.textContent.trim() : "Unknown";

  const url = window.location.href.split("?")[0];

  return { problemName, difficulty, topic, url };
}

function checkForAcceptedSubmission() {
  const acceptedElements = [
    ...document.querySelectorAll('[data-e2e-locator="submission-result"]'),
    ...document.querySelectorAll('[class*="accepted"]'),
    ...Array.from(document.querySelectorAll("span, div")).filter(
      (el) => el.textContent.trim() === "Accepted",
    ),
  ];

  for (const element of acceptedElements) {
    const submissionText = element.textContent;
    if (submissionText.includes("Accepted")) {
      const timestamp = Date.now();
      if (!lastCheckedSub || timestamp - lastCheckedSub > 5000) {
        lastCheckedSub = timestamp;

        const problemInfo = getProblemInfo();
        console.log("Problem solved!", problemInfo);

        chrome.runtime.sendMessage({
          type: "PROBLEM_SOLVED",
          data: {
            ...problemInfo,
            solvedAt: new Date().toISOString(),
          },
        });

        return true;
      }
    }
  }
  return false;
}

setTimeout(checkForAcceptedSubmission, 2000);

const observer = new MutationObserver((mutations) => {
  checkForAcceptedSubmission();
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});

let lastUrl = location.href;

new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    setTimeout(checkForAcceptedSubmission, 2000);
  }
}).observe(document, { subtree: true, childList: true });
