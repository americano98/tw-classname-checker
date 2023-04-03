chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status == 'complete' && tab.active) {
    chrome.tabs.sendMessage(tabId, {
      type: "PR_OPENED",
      tabId
    });
  }
});