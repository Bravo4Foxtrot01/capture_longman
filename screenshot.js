document.addEventListener("DOMContentLoaded", function () {
    chrome.storage.local.get("screenshotData", function (data) {
        if (data.screenshotData) {
            let img = document.createElement("img");
            img.src = data.screenshotData;
            img.style.width = "100%";
            document.body.appendChild(img);
        }
    });
});