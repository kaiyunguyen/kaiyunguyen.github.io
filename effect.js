let refreshTimer;

// initial auto-refresh (15s)
refreshTimer = setTimeout(() => {
    location.reload();
}, 15000);

const welcome = document.getElementById("welcomeScreen");
const photobooth = document.getElementById("photoboothScreen");

const webcamVideo = document.getElementById("webcamVideo");
const constraints = {
    video: {
        width: 1280,
        height: 720,
        facingMode: "user",
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
