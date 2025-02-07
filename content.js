console.log("LDOCE Sense Screenshot 插件已加载！");

// 监听 DOM 变化
const observer = new MutationObserver((mutationsList, observer) => {
    for (let mutation of mutationsList) {
        if (mutation.type === "childList" || mutation.type === "subtree") {
            addScreenshotButtons();
        }
    }
});

// 观察整个 body
observer.observe(document.body, { childList: true, subtree: true });

function addScreenshotButtons() {
    let senseElements = document.querySelectorAll("span.Sense");
    console.log(`找到 ${senseElements.length} 个 Sense 标签`);

    senseElements.forEach(sense => {
        if (sense.dataset.hasButton) return; // 避免重复添加按钮
        sense.dataset.hasButton = "true";

        let button = document.createElement("button");
        button.textContent = "📸";
        button.style.position = "absolute";
        button.style.left = sense.getBoundingClientRect().left + window.scrollX + "px";
        button.style.top = sense.getBoundingClientRect().top + window.scrollY - 30 + "px";
        button.style.background = "#ffcc00";
        button.style.border = "1px solid #b38f00";
        button.style.padding = "5px 10px";
        button.style.cursor = "pointer";
        button.style.zIndex = "1000";

        button.addEventListener("click", () => {
            // 发送消息给后台脚本请求截图
            chrome.runtime.sendMessage({ action: "captureScreenshot" }, (response) => {
                if (response && response.imgUrl) {
                    let link = document.createElement("a");
                    link.href = response.imgUrl;
                    link.download = "screenshot.png";
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }
            });
        });
        document.body.appendChild(button);
    });
}