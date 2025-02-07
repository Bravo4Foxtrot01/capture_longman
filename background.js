chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "capture") {
        chrome.tabs.captureVisibleTab(null, { format: "png" }, function (image) {
            chrome.storage.local.set({ screenshotData: image }, () => {
                chrome.tabs.create({ url: "screenshot.html" });
            });
        });
    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "captureScreenshot") {
        chrome.tabs.captureVisibleTab(null, { format: "png" }, (imgUrl) => {
            sendResponse({ imgUrl: imgUrl });
        });
        return true; // 保持消息通道开启，直到 sendResponse 被调用
    }
});