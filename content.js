console.log("LDOCE Sense Screenshot 插件已加载！");

// 监听 DOM 变化
const observer = new MutationObserver((mutationsList) => {
    let needsUpdate = false;

    for (let mutation of mutationsList) {
        if (mutation.type === "childList" || mutation.type === "subtree") {
            needsUpdate = true;
            break; // 只需要检查一次
        }
    }

    if (needsUpdate) {
        addScreenshotButtons();
    }
});

// 观察整个 body
observer.observe(document.body, { childList: true, subtree: true });

function addScreenshotButtons() {
    let senseElements = document.querySelectorAll("span.Sense");
    console.log(`找到 ${senseElements.length} 个 Sense 标签`);

    senseElements.forEach(sense => {
        if (sense.dataset.hasButton) return;
        sense.dataset.hasButton = "true";

        let button = document.createElement("button");
        button.textContent = "📸";
        button.className = "screenshot-button";

        // 获取 Sense 元素的位置信息
        const rect = sense.getBoundingClientRect();
        const scrollX = window.scrollX;
        const scrollY = window.scrollY;

        // 设置按钮样式和位置
        button.style.cssText = `
            position: absolute;
            left: ${rect.right + scrollX + 5}px;
            top: ${rect.top + scrollY}px;
            background: #ffcc00;
            border: 1px solid #b38f00;
            padding: 5px 10px;
            cursor: pointer;
            z-index: 1000;
        `;

        button.addEventListener("click", async () => {
            const updatedRect = sense.getBoundingClientRect();
            chrome.runtime.sendMessage({
                action: "captureScreenshot",
                x: updatedRect.left + window.scrollX,
                y: updatedRect.top + window.scrollY,
                width: updatedRect.width,
                height: updatedRect.height
            }, (response) => {
                if (chrome.runtime.lastError) {
                    console.error("发送消息时出错:", chrome.runtime.lastError);
                    return;
                }
                if (response && response.imgUrl) {
                    // 创建下载链接
                    const link = document.createElement("a");
                    link.href = response.imgUrl;
                    link.download = "sense-screenshot.png";
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }
            });
        });

        document.body.appendChild(button);
    });
}

// 更新按钮位置的函数
function updateButtonPositions() {
    const buttons = document.querySelectorAll(".screenshot-button");
    buttons.forEach(button => {
        const sense = button.previousElementSibling;
        if (sense) {
            const rect = sense.getBoundingClientRect();
            button.style.left = `${rect.right + window.scrollX + 5}px`;
            button.style.top = `${rect.top + window.scrollY}px`;
        }
    });
}