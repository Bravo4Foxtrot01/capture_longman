console.log("LDOCE Sense Screenshot 插件已加载！");

const observer = new MutationObserver((mutationsList) => {
    let needsUpdate = false;

    for (let mutation of mutationsList) {
        if (mutation.type === "childList" || mutation.type === "subtree") {
            needsUpdate = true;
            break;
        }
    }

    if (needsUpdate) {
        // 可根据需要添加逻辑
    }
});

observer.observe(document.body, { childList: true, subtree: true });

const style = document.createElement('style');
style.textContent = `
.sense-hover {
    border: 1px solid red !important;
}
.screenshot-toast {
    position: fixed;
    top: 20px;
    right: 20px;
    background-color: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 10px 20px;
    border-radius: 4px;
    z-index: 10000;
    font-size: 14px;
    animation: fadeInOut 2s ease-in-out;
}

@keyframes fadeInOut {
    0% { opacity: 0; transform: translateY(-10px); }
    15% { opacity: 1; transform: translateY(0); }
    85% { opacity: 1; transform: translateY(0); }
    100% { opacity: 0; transform: translateY(-10px); }
}`;
document.head.appendChild(style);

document.addEventListener("mouseover", (event) => {
    const sense = event.target.closest("span.Sense");
    if (sense) sense.classList.add("sense-hover");
});

document.addEventListener("mouseout", (event) => {
    const sense = event.target.closest("span.Sense");
    if (sense) sense.classList.remove("sense-hover");
});

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'screenshot-toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
        document.body.removeChild(toast);
    }, 2000);
}

document.querySelectorAll("span.Sense").forEach(sense => {
    sense.addEventListener("dblclick", (event) => {
        const rect = sense.getBoundingClientRect();
        const x = Math.round(rect.left + window.scrollX); // 基于页面的绝对坐标
        const y = Math.round(rect.top + window.scrollY); // 基于页面的绝对坐标
        const width = Math.round(rect.width + 2); // 加上左右边框
        const height = Math.round(rect.height + 2); // 加上上下边框

        // 打印红框的位置信息
        console.log("红框位置信息:");
        console.log("x:", x);
        console.log("y:", y);
        console.log("width:", width);
        console.log("height:", height);
        console.log("window.scrollX:", window.scrollX, "window.scrollY:", window.scrollY);
        console.log("rect:", rect);

        const cleanshotUrl = `cleanshot://all-in-one?x=${x}&y=${y}&width=${width}&height=${height}&action=copy`;

        // 打印 CleanShot 的参数
        console.log("CleanShot 参数:");
        console.log("cleanshotUrl:", cleanshotUrl);

        showToast("正在调用 CleanShot X 进行截图...");
        window.location.href = cleanshotUrl;
    });
});

function showSensePopup(content) {
    let overlay = document.createElement("div");
    overlay.style.cssText = `
        position: fixed;
        top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex; justify-content: center; align-items: center;
        z-index: 10000;
    `;

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

    let contentDiv = document.createElement("div");
    contentDiv.innerHTML = content;

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

    popup.appendChild(contentDiv);
    popup.appendChild(closeButton);
    overlay.appendChild(popup);
    document.body.appendChild(overlay);
}