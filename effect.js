let refreshTimer;

// initial auto-refresh (15s)
refreshTimer = setTimeout(() => {
    location.reload();
}, 15000);

const photos = [];
const welcome = document.getElementById("welcomeScreen");
const photobooth = document.getElementById("photoboothScreen");
const countdownEl = document.getElementById("countdown");
const shutterButton = document.getElementById("shutterButton");
const video = document.getElementById("webcamVideo");
const canvas = document.getElementById("snapshotCanvas");
const ctx = canvas.getContext("2d");
const stripCanvas = document.createElement("canvas");
const stripCtx = stripCanvas.getContext("2d");

/* Webcam Video access */
const webcamVideo = document.getElementById("webcamVideo");

const constraints = {
    video: {
        height: 600,
        width: 900,
        facingMode: "user"
    }
};

navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
    webcamVideo.srcObject = stream;
}).catch((error) => {
    console.error(error);
});

welcome.addEventListener("click", () => {
    // cancel refresh
    clearTimeout(refreshTimer);

    // switching views
    welcome.classList.add("hidden");
    photobooth.classList.remove("hidden");

    // auto-refresh set to 5 mins
    refreshTimer = setTimeout(() => {
        location.reload();
    }, 300000);
});

function startCountdown(onComplete) {
    let count = 5;
    
    countdownEl.style.color = "white";
    countdownEl.textContent = count;
    countdownEl.classList.remove("hidden");

    const interval = setInterval(() => {
        count--;

        if (count === 1) {
            countdownEl.style.color = "red";
            setTimeout(() => {
                countdownEl.classList.add("hidden");
                if (onComplete) onComplete();
            }, 700);
            clearInterval(interval);
        }

        if (count == 0) {
            clearInterval(interval);
            countdownEl.classList.add("hidden");
            if (onComplete) onComplete();
            return;
        }

        countdownEl.textContent = count;
    }, 1000);
}

function takeSnapshot() {
    const videoHeight = video.videoHeight;
    const videoWidth = video.videoWidth;

    if (!videoWidth || !videoHeight) return;

    canvas.height = videoHeight;
    canvas.width = videoWidth;

    ctx.save();
    ctx.translate(videoWidth, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, videoWidth, videoHeight);
    ctx.restore();

    const imageData = canvas.toDataURL("image/png");
    photos.push(imageData);
}

function takePhotoStrip() {
    photos.length = 0;
    let shots = 0;

    const takeNext = () => {
        if (shots === 3) {
            chooseStrip().then((stripFile) => {
                buildPhotoStrip(stripFile);
            });
            return;
        }

        startCountdown(() => {
            takeSnapshot();
            shots++;
            setTimeout(takeNext, 700);
        });
    };

    takeNext();
}

function chooseStrip() {
    return new Promise((resolve) => {
        const overlay = document.createElement("div");
        overlay.style.position = "fixed";
        overlay.style.inset = "0";
        overlay.style.background = "rgba(0,0,0,0.8)";
        overlay.style.display = "flex";
        overlay.style.justifyContent = "center";
        overlay.style.alignItems = "center";
        overlay.style.zIndex = "20";
        overlay.style.gap = "2rem";

        ["1", "2", "3"].forEach((num) => {
            const btn = document.createElement("button");
            btn.textContent = "Strip " + num;
            btn.style.fontSize = "2rem";
            btn.style.padding = "1rem 2rem";
            btn.style.cursor = "pointer";
            btn.addEventListener("click", () => {
                overlay.remove();
                resolve("style/strip" + num + ".png");
            });
            overlay.appendChild(btn);
        });

        document.body.appendChild(overlay);
    });
}

shutterButton.addEventListener("click", takePhotoStrip);

const stripLayout = {
    height: 1800,
    width: 600,

    slots: [
        { x: 80, y: 150, w: 440, h: 360 },
        { x: 80, y: 550, w: 440, h: 360 },
        { x: 80, y: 950, w: 440, h: 360 }
    ]
};

stripCanvas.width = stripLayout.width;
stripCanvas.height = stripLayout.height;

function flash() {
    const flash = document.createElement("div");
    flash.style.position = "absolute";
    flash.style.inset = "0";
    flash.style.background = "white";
    flash.style.zIndex = "30";
    document.body.appendChild(flash);

    setTimeout(() => flash.remove(), 100);
}

function loadImage(src) {
    return new Promise(resolve => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.src = src;
    });
}

async function buildPhotoStrip(stripImageSrc) {
    const stripImage = await loadImage(stripImageSrc);

    stripCtx.clearRect(0, 0, stripCanvas.width, stripCanvas.height);
    stripCtx.drawImage(stripImage, 0, 0, stripCanvas.width, stripCanvas.height);

    for (let i = 0; i < photos.length; i++) {
        const photoImg = await loadImage(photos[i]);
        const slot = stripLayout.slots[i];

        stripCtx.drawImage(photoImg, slot.x, slot.y, slot.w, slot.h, );
    }

    showFinalStrip();
}

function showFinalStrip() {
    document.body.appendChild(stripCanvas);
    stripCanvas.style.position = "fixed";
    stripCanvas.style.inset = "0";
    stripCanvas.style.width = "100vw";
    stripCanvas.style.height = "100vh";
    stripCanvas.style.objectFit = "contain";
    stripCanvas.style.zIndex = "10";
}
