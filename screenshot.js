document.addEventListener("DOMContentLoaded", function () {
    chrome.storage.local.get(["screenshotData", "screenshotSize"], function (data) {
        if (data.screenshotData && data.screenshotSize) {
            let { x, y, width, height } = data.screenshotSize;

            let tempImg = new Image();
            tempImg.src = data.screenshotData;
            tempImg.onload = function () {
                let canvas = document.createElement("canvas");
                let ctx = canvas.getContext("2d");

                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(tempImg, x, y, width, height, 0, 0, width, height);

                let croppedDataUrl = canvas.toDataURL("image/png");

                // 确保DOM完全加载后再显示弹窗
                setTimeout(() => {
                    showScreenshotPopup(croppedDataUrl);
                }, 100);
            };
        }
    });
});

// 创建弹窗显示截图
function showScreenshotPopup(imageSrc) {
    // 创建遮罩层
    let overlay = document.createElement("div");
    overlay.style.cssText = `
        position: fixed;
        top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex; justify-content: center; align-items: center;
        z-index: 999999;
    `;

    // 创建弹窗
    let popup = document.createElement("div");
    popup.style.cssText = `
        background: white;
        padding: 20px;
        border-radius: 8px;
        text-align: center;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
        display: flex;
        flex-direction: column;
        align-items: center;
        max-width: 90vw;
        max-height: 90vh;
        overflow: auto;
        position: relative;
    `;

    // 添加截图图片
    let img = new Image();
    img.src = imageSrc;
    
    // 图片加载完成后设置合适的尺寸
    img.onload = function() {
        const maxWidth = Math.min(window.innerWidth * 0.8, width);  // 最大宽度为窗口的80%或原始宽度
        const maxHeight = Math.min(window.innerHeight * 0.7, height); // 最大高度为窗口的70%或原始高度
        
        let imgWidth = this.naturalWidth;
        let imgHeight = this.naturalHeight;
        
        // 保持原始比例进行缩放
        const ratio = Math.min(maxWidth / imgWidth, maxHeight / imgHeight);
        
        if (ratio < 1) {
            imgWidth *= ratio;
            imgHeight *= ratio;
        }
        
        img.style.width = `${imgWidth}px`;
        img.style.height = `${imgHeight}px`;
        img.style.objectFit = 'contain';
    };
    
    img.style.display = 'block';
    img.style.border = "1px solid #ddd";
    img.style.maxWidth = '100%';
    img.style.maxHeight = '70vh';

    // 创建按钮
    let button = document.createElement("button");
    button.textContent = "复制截图";
    button.style.cssText = `
        margin-top: 15px;
        padding: 10px 20px;
        font-size: 16px;
        border: none;
        background: #007bff;
        color: white;
        border-radius: 5px;
        cursor: pointer;
    `;

    button.addEventListener("click", async () => {
        await copyToClipboard(imageSrc);
        document.body.removeChild(overlay);
    });

    // 监听回车键和ESC键
    document.addEventListener("keydown", async function handleKeyPress(event) {
        if (event.key === "Enter") {
            await copyToClipboard(imageSrc);
            document.body.removeChild(overlay);
            document.removeEventListener("keydown", handleKeyPress);
        } else if (event.key === "Escape") {
            document.body.removeChild(overlay);
            document.removeEventListener("keydown", handleKeyPress);
        }
    });

    // 组装组件
    popup.appendChild(img);
    popup.appendChild(button);
    overlay.appendChild(popup);
    
    // 确保在DOM完全准备好后再添加弹窗
    if (document.readyState === "complete") {
        document.body.appendChild(overlay);
    } else {
        window.addEventListener('load', () => {
            document.body.appendChild(overlay);
        });
    }
}

// 复制图片到剪贴板
async function copyToClipboard(imageSrc) {
    try {
        let response = await fetch(imageSrc);
        let blob = await response.blob();
        let clipboardItem = new ClipboardItem({ "image/png": blob });
        await navigator.clipboard.write([clipboardItem]);
        alert("截图已复制到剪贴板！");
    } catch (err) {
        console.error("复制到剪贴板失败:", err);
        alert("复制失败，请手动保存截图！");
    }
}