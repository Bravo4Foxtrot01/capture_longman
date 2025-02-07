console.log("LDOCE Sense Screenshot 插件已加载！");

// 监听 DOM 变化
const observer = new MutationObserver((mutationsList) => {
    let needsUpdate = false;

    for (let mutation of mutationsList) {
        if (mutation.type === "childList" || mutation.type === "subtree") {
            needsUpdate = true;
            break;
        }
    }

    if (needsUpdate) {
        addScreenshotButtons();
    }
});

// 观察整个 body
observer.observe(document.body, {childList: true, subtree: true});

const style = document.createElement('style');
style.textContent = `
.screenshot-toast {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background-color: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 10px 20px;
    border-radius: 4px;
    z-index: 10000;
    font-size: 14px;
    animation: fadeInOut 2s ease-in-out;
}

@keyframes fadeInOut {
    0% { opacity: 0; transform: translate(-50%, 20px); }
    15% { opacity: 1; transform: translate(-50%, 0); }
    85% { opacity: 1; transform: translate(-50%, 0); }
    100% { opacity: 0; transform: translate(-50%, -20px); }
}

.sense-hover {
    border: 1px solid red !important;
}`;
document.head.appendChild(style);

// 监听鼠标移动
function handleMouseOver(event) {
    const sense = event.target.closest("span.Sense");
    if (sense) {
        sense.classList.add("sense-hover");
    }
}

function handleMouseOut(event) {
    const sense = event.target.closest("span.Sense");
    if (sense) {
        sense.classList.remove("sense-hover");
    }
}

document.addEventListener("mouseover", handleMouseOver);
document.addEventListener("mouseout", handleMouseOut);

// 添加 Toast 提示函数
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'screenshot-toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
        document.body.removeChild(toast);
    }, 2000);
}

function addScreenshotButtons() {
    let senseElements = document.querySelectorAll("span.Sense");
    console.log(`找到 ${senseElements.length} 个 Sense 标签`);

    senseElements.forEach(sense => {
        if (sense.dataset.hasButton) return;
        sense.dataset.hasButton = "true";

        let button = document.createElement("button");
        button.textContent = "📸";
        button.className = "screenshot-button";

        const rect = sense.getBoundingClientRect();
        const scrollX = window.scrollX;
        const scrollY = window.scrollY;

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
            }, async (response) => {
                if (chrome.runtime.lastError) {
                    console.error("发送消息时出错:", chrome.runtime.lastError);
                    showToast("截图失败！");
                    return;
                }
                if (response && response.imgUrl) {
                    try {
                        const blob = response.imgBlob;
                        const item = new ClipboardItem({"image/png": blob});
                        await navigator.clipboard.write([item]);
                        showToast("截图已复制到剪贴板！");
                        const link = document.createElement("a");
                        link.href = response.imgUrl;
                        link.download = "sense-screenshot.png";
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    } catch (err) {
                        console.error("复制到剪贴板失败:", err);
                        showToast("复制到剪贴板失败！");
                    }
                }
            });
        });

        sense.addEventListener("dblclick", () => {
            const rect = sense.getBoundingClientRect();
            const x = Math.round(rect.left + window.scrollX);
            const y = Math.round(rect.top + window.scrollY);
            const width = Math.round(rect.width);
            const height = Math.round(rect.height);

            const cleanshotUrl = `cleanshot://capture-area?x=${x}&y=${y}&width=${width}&height=${height}&action=copy`;
            window.location.href = cleanshotUrl;
        });

        document.body.appendChild(button);
    });
}

function showSensePopup(content) {
    // Create overlay
    let overlay = document.createElement("div");
    overlay.style.cssText = `
        position: fixed;
        top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex; justify-content: center; align-items: center;
        z-index: 10000;
    `;

    // Create popup
    let popup = document.createElement("div");
    popup.style.cssText = `
        background: white;
        padding: 20px;
        border-radius: 8px;
        text-align: center;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
        max-width: 80%;
        max-height: 80%;
        overflow: auto;
    `;

    // Add content
    let contentDiv = document.createElement("div");
    contentDiv.innerHTML = content;

    // Create close button
    let closeButton = document.createElement("button");
    closeButton.textContent = "关闭";
    closeButton.style.cssText = `
        margin-top: 15px;
        padding: 10px 20px;
        font-size: 16px;
        border: none;
        background: #007bff;
        color: white;
        border-radius: 5px;
        cursor: pointer;
    `;

    closeButton.addEventListener("click", () => {
        document.body.removeChild(overlay);
    });

    // Assemble components
    popup.appendChild(contentDiv);
    popup.appendChild(closeButton);
    overlay.appendChild(popup);
    document.body.appendChild(overlay);
}