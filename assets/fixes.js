// === SOLAR FLY PATCH v3.3 CLEAN CORE ===
// Only One-Time Door Animation
// ❌ No Audio
// ❌ No Tutorial
// ❌ No Pointer

(function injectCSS() {
  const style = document.createElement("style");
  style.textContent = `
    #doorContainer {
      position: relative;
      width: 100vw;
      height: 100vh;
      overflow: hidden;
      z-index: 1;
    }

    .door-left, .door-right {
      position: absolute;
      width: 50%;
      height: 100%;
      top: 0;
      background: black;
      transition: transform 0.6s ease-out;
    }

    .door-left { left: 0; }
    .door-right { right: 0; }

    .door-open .door-left { transform: translateX(-100%); }
    .door-open .door-right { transform: translateX(100%); }

    #splash_loading {
      display: none;
      justify-content: center;
      align-items: center;
      background: rgba(0,0,0,0.85);
      z-index: 10000;
      position: fixed;
      top: 0; left: 0;
      width: 100vw; height: 100vh;
    }
  `;
  document.head.appendChild(style);
})();

// Ensure a default door animation duration (milliseconds) is available for the HTML logic
window.DOOR_ANIMATION_DURATION = window.DOOR_ANIMATION_DURATION || 5000;

window.addEventListener("load", () => {

  // Remove unwanted screens if exist
  // document.querySelectorAll(".screen").forEach(s => {
  //   if (s.id === "splash2") {
  //     s.remove();
  //   }
  // });

  // One-Time Door Animation
  let doorOpened = false;

  if (typeof window.initialLoadingScreen === "function") {
    window.initialLoadingScreen = function(callback) {

      const splash = document.getElementById("splash_loading");
      const door = document.getElementById("doorContainer");

      if (!doorOpened && splash && door) {

        splash.style.display = "flex";

        setTimeout(() => {
          door.classList.add("door-open");
          doorOpened = true;

          setTimeout(() => {
            splash.style.display = "none";
            callback?.();
          }, 600);

        }, 500);

      } else {
        splash?.style.setProperty("display", "none");
        callback?.();
      }
    };
  }

});