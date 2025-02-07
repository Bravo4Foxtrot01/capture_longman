chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "capture") {
        chrome.tabs.captureVisibleTab(null, { format: "png" }, function (image) {
            chrome.storage.local.set({ screenshotData: image }, () => {
                chrome.tabs.create({ url: "screenshot.html" });
            });
        });
    }
});