class Counter {
    constructor(pos, area, html_el) {
        this.pos = pos;
        this.area = area;
        this.offset_polar = [area / 2.0, 0]; // r, theta
        this.offset_speeds = [0, 0];
        this.stopped = false;
        this.collision_cooldown = 0;
        this.drag_offset = null;
        this.html_el = html_el;

        /// Countdown
        setInterval(() => {
            this.html_el.textContent = Math.max(
                this.html_el.textContent - 1,
                0,
            );
            this.collision_cooldown = Math.max(this.collision_cooldown - 1, 0);

            if (this.html_el.textContent == 0) {
                this.html_el.style.color = "red";
                this.stopped = true;
            }
        }, 1000);

        /// Drag
        // Hack because "this" overwriten in event handlers..
        let self = this;
        function startDrag(e) {
            e.preventDefault();
            e.stopPropagation();

            let rect = html_el.getBoundingClientRect();

            function dragObject(e) {
                e.preventDefault();
                e.stopPropagation();
                let clientX, clientY;

                if (e.type == "mousemove") {
                    clientX = e.clientX;
                    clientY = e.clientY;
                } else if (e.type == "touchmove") {
                    clientX = e.targetTouches[0].clientX;
                    clientY = e.targetTouches[0].clientY;
                }

                self.set_pos([
                    clientX - self.drag_offset[0],
                    clientY - self.drag_offset[1],
                ]);
            }

            document.addEventListener(
                "mouseup",
                function () {
                    self.drag_offset = null;
                    window.removeEventListener("mousemove", dragObject, true);
                    window.removeEventListener("touchmove", dragObject, true);
                },
                true,
            );

            if (e.type == "mousedown") {
                self.drag_offset = [
                    e.clientX - rect.left,
                    e.clientY - rect.top,
                ];
                window.addEventListener("mousemove", dragObject, true);
            } else if (e.type == "touchstart") {
                self.drag_offset = [
                    e.targetTouches[0].clientX - rect.left,
                    e.targetTouches[0].clientY - rect.top,
                ];
                window.addEventListener("touchmove", dragObject, true);
            }
        }
        this.html_el.addEventListener("mousedown", startDrag, true);
        this.html_el.addEventListener("touchstart", startDrag, true);
    }

    set_pos(target) {
        this.pos[0] =
            this.offset_polar[0] + Math.cos(this.offset_polar[1]) + target[0];
        this.pos[1] =
            this.offset_polar[1] + Math.sin(this.offset_polar[1]) + target[1];
        this.offset_polar = [0, 0];
        this.offset_speeds = [0, 0];

        this.html_el.style.left = `${this.pos[0]}px`;
        this.html_el.style.top = `${this.pos[1]}px`;
    }

    get_pos() {
        return [
            this.offset_polar[0] + Math.cos(this.offset_polar[1]),
            this.offset_polar[1] + Math.sin(this.offset_polar[1]),
        ];
    }

    update(dt) {
        if (this.stopped) return;

        // Update speeds
        this.offset_speeds[0] += (Math.random() - 0.5) * 10; // r
        this.offset_speeds[1] += (Math.random() - 0.5) * 0.05; // theta
        // Max rot. speed
        if (this.offset_speeds[1] > 0.1) {
            this.offset_speeds[1] = 0.1;
        }

        // Update positions
        this.offset_polar[0] += dt * this.offset_speeds[0];
        this.offset_polar[1] += dt * this.offset_speeds[1];

        if (this.offset_polar[0] < 0) {
            this.offset_polar[0] = 0;
            this.offset_speeds[0] *= -0.5;
        }

        if (this.offset_polar[0] > this.area) {
            this.offset_polar[0] = this.area;
            this.offset_speeds[0] *= -0.5;
        }

        const x =
            this.pos[0] + this.offset_polar[0] * Math.cos(this.offset_polar[1]);
        const y =
            this.pos[1] + this.offset_polar[0] * Math.sin(this.offset_polar[1]);

        this.html_el.style.left = `${x}px`;
        this.html_el.style.top = `${y}px`;
    }
}

let countdowns = [];
function init() {
    var time_format = new Intl.NumberFormat("en-US", {
        minimumIntegerDigits: 2,
    });
    setInterval(() => {
        let txt_el = document.getElementById("global-hour");
        let txt_parts = txt_el.textContent.split(":");
        let secs = parseInt(txt_parts[2]) + 1;
        let mins = parseInt(txt_parts[1]) + Math.floor(secs / 60);

        if (mins >= 60) {
            alert("END");
            // END
        }

        txt_parts[1] = time_format.format(mins % 60);
        txt_parts[2] = time_format.format(secs % 60);
        txt_el.textContent = txt_parts.join(":");
    }, 1000);

    let countdowns_el = document.getElementById("main-countdowns");
    for (let i = 0; i < 50; ++i) {
        let node = document.createElement("div");
        node.className = "countdown";
        node.id = `countdown-${i}`;
        node.style.color = "blue";

        let time = document.createElement("span");
        time.textContent = 10;
        node.appendChild(time);
        countdowns_el.appendChild(node);

        const x = Math.random() * window.innerWidth * 0.9;
        const y = Math.random() * window.innerHeight * 0.9;
        countdowns.push(new Counter([x, y], 32 * 2, node));
    }
    requestAnimationFrame(step);
}

// Main loop
let start;
function step(timestamp) {
    if (start === undefined) {
        start = timestamp;
    }
    const dt = timestamp - start;
    start = timestamp;

    // Update positions
    countdowns.forEach((x) => x.update(dt / 1000));

    // Collisions
    for (let i = 0; i < countdowns.length; ++i) {
        if (countdowns[i].collision_cooldown > 0 || countdowns[i].stopped)
            continue;

        const i_aabb = countdowns[i].html_el.getBoundingClientRect();

        for (let j = i + 1; j < countdowns.length; ++j) {
            if (countdowns[j].collision_cooldown > 0 || countdowns[j].stopped)
                continue;

            const j_aabb = countdowns[j].html_el.getBoundingClientRect();

            const isColliding =
                i_aabb.right >= j_aabb.left &&
                i_aabb.left <= j_aabb.right &&
                i_aabb.bottom >= j_aabb.top &&
                i_aabb.top <= j_aabb.bottom;

            if (isColliding) {
                const i_val = parseInt(countdowns[i].html_el.textContent);
                const j_val = parseInt(countdowns[j].html_el.textContent);
                if (countdowns[i].drag_offset !== null) {
                    countdowns[i].html_el.textContent = i_val - j_val;
                } else if (countdowns[j].drag_offset !== null) {
                    countdowns[j].html_el.textContent = j_val - i_val;
                } else {
                    countdowns[i].html_el.textContent = i_val + j_val;
                    countdowns[j].html_el.textContent = i_val + j_val;
                }

                countdowns[i].collision_cooldown = 5;
                countdowns[j].collision_cooldown = 5;
            }
        }
    }
    requestAnimationFrame(step);
}





// SplitText (Intro)

gsap.registerPlugin(SplitText)

const split = new SplitText('#intro-1', { type: 'chars' })

let intro = document.querySelector('.intro');
let mainGame = document.querySelectorAll('.main-game')

// -1 = accueil
// 0 = intro
// 1 = boucle principale
// 2 = game over 
// 3 = win
// 4 = écran de fin

let gameState = -1;

document.body.addEventListener("keyup", (e) => {
  if ((e.key === "Enter" || e.key === "Escape" || e.key === "Space" || e.keyCode == 32)) {
    console.log(gameState)
    if (gameState == -1) {
      launchIntro(); 
      gameState++; 
      return
    }
    if (gameState == 0) {
      launchGame(); 
      gameState++; 
      return
    }
    else {
      return
    }};
});


function launchIntro() {
 
  intro.style.display = "block";

  const typing_text = gsap.timeline()
    .from(split.chars, {
    duration: .02,
    autoAlpha: 0,
    stagger: {
      each: .08,
    }
  });

  const blink = gsap.timeline({ repeat: -1, repeatDelay: .11 })
    .to('.bar', { duration: .32, autoAlpha: 0 })

  }

function launchGame() {

  mainGame.forEach((el)=> {el.style.display = "block"});
  intro.style.display = "none";
  init();

}

