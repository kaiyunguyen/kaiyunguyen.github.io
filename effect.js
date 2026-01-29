let refreshTimer;

// initial auto-refresh (15s)
refreshTimer = setTimeout(() => {
    location.reload();
}, 15000)

const welcome = document.getElementById("welcomeScreen");
const photobooth = document.getElementById("photoboothScreen");

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
