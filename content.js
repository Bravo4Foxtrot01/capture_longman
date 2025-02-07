console.log("LDOCE Sense Screenshot 插件已加载！");

// 监听 DOM 变化，保留是为了后续可能对鼠标悬停和双击功能更新做准备
const observer = new MutationObserver((mutationsList) => {
    let needsUpdate = false;

    for (let mutation of mutationsList) {
        if (mutation.type === "childList" || mutation.type === "subtree") {
            needsUpdate = true;
            break;
        }
    }

    if (needsUpdate) {
        // 这里不再调用 addScreenshotButtons，可根据需要添加其他逻辑
    }
});

// 观察整个 body
observer.observe(document.body, { childList: true, subtree: true });

const style = document.createElement('style');
style.textContent = `
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

// 双击调用 CleanShot X 的功能保留
document.querySelectorAll("span.Sense").forEach(sense => {
    sense.addEventListener("dblclick", () => {
        const rect = sense.getBoundingClientRect();
        const x = Math.round(rect.left + window.scrollX);
        const y = Math.round(rect.top + window.scrollY);
        const width = Math.round(rect.width);
        const height = Math.round(rect.height);

        const cleanshotUrl = `cleanshot://capture-area?x=${x}&y=${y}&width=${width}&height=${height}&action=copy`;
        window.location.href = cleanshotUrl;
    });
});

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