
/* Default */
gsap.defaults({
    ease: "power4.out",
    duration: 1,
});

// gsap.from(".classe", {
//     opacity: 0,
//     duration: 5,
//     delay: 1
// });



const globalCountdown = 600 * 5;

let mainGame = document.querySelector(".main-game");

// Pour gérer timeout facilement - https://www.sitepoint.com/delay-sleep-pause-wait/
function sleep(ms) {
  return new Promise((fonction) => setTimeout(fonction, ms));
}

//   // Timer
//   let seconds = globalCountdown;
//   let timer = document.querySelector("#timer");

//   const timerInterval = setInterval(() => {
//     seconds--;

//     timer.innerText = (seconds % 60).toString();

//     if (seconds <= 5) {
//       timer.style.color = "red";
//     }

//     if (seconds === 0) {
//       clearInterval(timerInterval);
//       endGame();
//     }
//   }, 1000);

//   initObjects();
//   renderObjects();
// }

//exemple : 
//   sleep(1500).then(() => {
//     mainGame.style.display = "flex";
//     mainGame.style.animation = "apparition 1.5s 1";
//     introduction.style.display = "none";
//   });