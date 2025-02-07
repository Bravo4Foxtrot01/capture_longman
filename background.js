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

            chrome.storage.local.set({
                screenshotData: imgUrl,
                screenshotSize: {
                    x: request.x,
                    y: request.y,
                    width: request.width,
                    height: request.height
                }
            }, () => {
                const img = new Image();
                img.onload = function() {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    canvas.width = request.width;
                    canvas.height = request.height;

                    ctx.drawImage(
                        img,
                        request.x, request.y,
                        request.width, request.height,
                        0, 0,
                        request.width, request.height
                    );

                    // 获取裁剪后的图片数据
                    canvas.toBlob((blob) => {
                        // 发送blob数据到content script进行复制
                        const reader = new FileReader();
                        reader.onloadend = function() {
                            sendResponse({
                                success: true,
                                imgUrl: canvas.toDataURL('image/png'),
                                imgBlob: blob
                            });
                        };
                        reader.readAsDataURL(blob);
                    }, 'image/png');
                };
                img.src = imgUrl;
            });
        });

        return true;
    }
});