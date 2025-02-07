(async function() {
  // 等待 DOM 加载完成
  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".Sense").forEach((sense) => {
      // 创建截图按钮
      let button = document.createElement("button");
      button.className = "screenshot-button";
      button.innerHTML = "📸"; // 使用相机 emoji 作为图标
      button.title = "截取此解释";

      // 插入按钮到解释的右侧
      sense.style.position = "relative";  // 让按钮相对这个元素定位
      sense.appendChild(button);

      // 点击按钮触发截图
      button.addEventListener("click", async () => {
        captureElement(sense);
      });
    });
  });

  // 使用 html2canvas 进行截图
  async function captureElement(element) {
    const canvas = await html2canvas(element, {
      backgroundColor: "#fff",
      scale: 2  // 提高截图清晰度
    });
    const image = canvas.toDataURL("image/png");

    // 触发下载
    let link = document.createElement("a");
    link.href = image;
    link.download = "definition_screenshot.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
})();