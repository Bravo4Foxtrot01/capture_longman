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
            if (chrome.runtime.lastError) {
                console.error("截图失败:", chrome.runtime.lastError);
                sendResponse({ success: false });
                return;
            }

            // 存储截图数据和 Sense 元素大小
            chrome.storage.local.set({
                screenshotData: imgUrl,
                screenshotSize: {
                    x: request.x,
                    y: request.y,
                    width: request.width,
                    height: request.height
                }
            }, () => {
                // 直接在 background 中进行裁剪
                const img = new Image();
                img.onload = function() {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    // 设置画布大小为 Sense 元素的大小
                    canvas.width = request.width;
                    canvas.height = request.height;

                    // 只绘制 Sense 元素区域
                    ctx.drawImage(
                        img,
                        request.x, request.y,
                        request.width, request.height,
                        0, 0,
                        request.width, request.height
                    );

                    // 获取裁剪后的图片数据
                    const croppedImageUrl = canvas.toDataURL('image/png');
                    sendResponse({ success: true, imgUrl: croppedImageUrl });
                };
                img.src = imgUrl;
            });
        });

        return true;
    }
});