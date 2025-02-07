function addScreenshotButtons() {
    console.log("Adding screenshot buttons..."); // 添加调试日志
    const senseElements = document.querySelectorAll(".Sense");
    console.log("Found sense elements:", senseElements.length); // 添加调试日志

    senseElements.forEach((sense) => {
        // 检查是否已经添加过按钮
        if (!sense.querySelector('.screenshot-button')) {
            let button = document.createElement("button");
            button.className = "screenshot-button";
            button.innerHTML = "📸";
            button.title = "截取此解释";

            sense.style.position = "relative";
            sense.appendChild(button);

            button.addEventListener("click", async () => {
                try {
                    await captureElement(sense);
                } catch (error) {
                    console.error("截图出错:", error);
                }
            });
        }
    });
}

async function captureElement(element) {
    const canvas = await html2canvas(element, {
        backgroundColor: "#fff",
        scale: 2
    });
    const image = canvas.toDataURL("image/png");

    const link = document.createElement("a");
    link.href = image;
    link.download = "definition_screenshot.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// 使用 MutationObserver 监听 DOM 变化
const observer = new MutationObserver((mutations) => {
    addScreenshotButtons();
});

// 开始观察
observer.observe(document.body, {
    childList: true,
    subtree: true
});

// 初始运行一次
addScreenshotButtons();