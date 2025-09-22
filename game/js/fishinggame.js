// fishinggame.js
document.addEventListener("DOMContentLoaded", function () {

    const game = document.querySelector(".game");
    let score = 0;
    let time = 60; // seconds
    let timerInterval;

    // Step buttons
    const startButton = document.getElementById("startButton");
    const step1Continue = document.getElementById("step1Continue");
    const step2Continue = document.getElementById("step2Continue");
    const replayButton = document.getElementById("replayButton");

    // Step navigation
    function goToStep(stepNumber) {
        game.className = `game step-${stepNumber}`;
    }

    startButton.addEventListener("click", () => goToStep(1));
    step1Continue.addEventListener("click", () => goToStep(2));
    step2Continue.addEventListener("click", () => goToStep(3));
    replayButton.addEventListener("click", () => location.reload());

    // Step 3: Fishing Board
    const board = document.querySelector(".board");
    const scoreDiv = document.querySelector(".score");
    const timeDiv = document.querySelector(".time");

    function startGame() {
        score = 0;
        time = 60;
        updateScore();
        updateTime();

        spawnFish();
        timerInterval = setInterval(() => {
            time--;
            updateTime();
            if (time <= 0) {
                clearInterval(timerInterval);
                goToStep(5);
            }
        }, 1000);
    }

    function updateScore() {
        scoreDiv.textContent = "Score: " + score;
    }

    function updateTime() {
        timeDiv.textContent = "Time: " + time;
    }

    // Fish spawning & animation
    const fishImages = [
        "config/images/fish01-0.png",
        "config/images/fish02-0.png",
        "config/images/fish03-0.png"
    ];

    function spawnFish() {
        for (let i = 0; i < 5; i++) {
            const fish = document.createElement("div");
            fish.className = "fish";
            fish.style.backgroundImage = `url(${fishImages[i % fishImages.length]})`;
            fish.style.width = "100px";
            fish.style.height = "50px";
            fish.style.position = "absolute";
            fish.style.top = `${50 + i * 70}px`;
            fish.style.left = "-120px";
            board.appendChild(fish);

            animateFish(fish);
        }
    }

    function animateFish(fish) {
        let pos = -120;
        const speed = 1 + Math.random() * 2; // px per frame
        function move() {
            pos += speed;
            fish.style.left = pos + "px";
            if (pos < 720) {
                requestAnimationFrame(move);
            } else {
                fish.remove();
            }
        }
        move();

        fish.addEventListener("click", () => {
            score += 10;
            updateScore();
            fish.remove();
        });
    }

    // Start step 3 game automatically
    document.querySelector("#step2Continue").addEventListener("click", startGame);
});
