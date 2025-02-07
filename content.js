import html2canvas from 'html2canvas';

function addScreenshotButtons() {
    console.log("Adding screenshot buttons..."); // Adding debug log
    const senseElements = document.querySelectorAll(".Sense");
    console.log("Found sense elements:", senseElements.length); // Adding debug log

    senseElements.forEach((sense) => {
        // Check if the button is already added
        if (!sense.querySelector('.screenshot-button')) {
            let button = document.createElement("button");
            button.className = "screenshot-button";
            button.innerHTML = "📸";
            button.title = "Capture this explanation";

            sense.style.position = "relative";
            sense.appendChild(button);

            button.addEventListener("click", async () => {
                try {
                    await captureElement(sense);
                } catch (error) {
                    console.error("Screenshot error:", error);
                }
            });
        }
    });
}

async function captureElement(element) {
    try {
        const canvas = await html2canvas(element, {
            backgroundColor: "#fff",
            scale: 2
        });

        if (!canvas || typeof canvas.toDataURL !== 'function') {
            throw new Error("Invalid canvas object");
        }

        const image = canvas.toDataURL("image/png");

        const index = Array.from(document.querySelectorAll('.Sense')).indexOf(element);
        const link = document.createElement("a");
        link.href = image;
        link.download = `definition_screenshot_${index}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.error("Screenshot error:", error);
    }
}