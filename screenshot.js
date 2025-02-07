document.addEventListener("DOMContentLoaded", function () {
    chrome.storage.local.get(["screenshotData", "screenshotSize"], function (data) {
        if (data.screenshotData && data.screenshotSize) {
            let img = document.createElement("img");
            img.src = data.screenshotData;

            let canvas = document.createElement("canvas");
            let ctx = canvas.getContext("2d");

            let { x, y, width, height } = data.screenshotSize;
            canvas.width = width;
            canvas.height = height;

            let tempImg = new Image();
            tempImg.src = data.screenshotData;
            tempImg.onload = function () {
                ctx.drawImage(tempImg, x, y, width, height, 0, 0, width, height);
                img.src = canvas.toDataURL("image/png"); // 更新裁剪后的图片

                document.body.appendChild(img);
            };
        }
    });
});