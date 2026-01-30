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

shutterButton.addEventListener("click", () => {
    takePhotoStrip();
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

    if (!w || !h) return;

    canvas.height = videoHeight;
    canvas.width = videoWidth;

    ctx.save();
    ctx.translate(w, 0);
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
            console.log("Strip complete", photos);
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

function flash() {
    const flash = document.createElement("div");
    flash.style.position = "absolute";
    flash.style.inset = "0";
    flash.style.background = "white";
    flash.style.zIndex = "30";
    document.body.appendChild(flash);

    setTimeout(() => flash.remove(), 100);
}
