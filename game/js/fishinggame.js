// fishinggame.js
document.addEventListener("DOMContentLoaded", function () {

    const game = document.querySelector(".game");
    let score = 0;
    let time = 60;
    let timerInterval;

    // Buttons
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
    step2Continue.addEventListener("click", () => {
        goToStep(3);
        startGame();
    });
    replayButton.addEventListener("click", () => location.reload());

    // Board elements
    const board = document.querySelector(".board");
    const scoreDiv = document.querySelector(".score");
    const timeDiv = document.querySelector(".time");

    function updateScore() {
        scoreDiv.textContent = "Score: " + score;
    }

    function updateTime() {
        timeDiv.textContent = "Time: " + time;
    }

    // Step 3: Fishing game
    function startGame() {
        score = 0;
        time = 60;
        updateScore();
        updateTime();

        spawnFish();
        spawnHook();
        timerInterval = setInterval(() => {
            time--;
            updateTime();
            if (time <= 0) {
                clearInterval(timerInterval);
                goToStep(5);
            }
        }, 1000);
    }

    // Fish setup
    const fishData = [
        {src: "config/images/fish01-0.png", width: 119, height: 49, points: 10},
        {src: "config/images/fish02-0.png", width: 143, height: 65, points: 20},
        {src: "config/images/fish03-0.png", width: 98, height: 34, points: 5}
    ];

    function spawnFish() {
        for (let i = 0; i < 5; i++) {
            createFish(fishData[i % fishData.length], 50 + i * 80);
        }
        setInterval(() => {
            const fishType = fishData[Math.floor(Math.random() * fishData.length)];
            createFish(fishType, Math.random() * 400 + 50);
        }, 2000);
    }

    function createFish(data, topPos) {
        const fish = document.createElement("div");
        fish.className = "fish";
        fish.style.backgroundImage = `url(${data.src})`;
        fish.style.width = data.width + "px";
        fish.style.height = data.height + "px";
        fish.style.position = "absolute";
        fish.style.top = topPos + "px";
        fish.style.left = "-200px";
        board.appendChild(fish);

        animateFish(fish, data.points);
    }

    function animateFish(fish, points) {
        let pos = -200;
        const speed = 1 + Math.random() * 2;

        function move() {
            pos += speed;
            fish.style.left = pos + "px";
            if (pos < 720) requestAnimationFrame(move);
            else fish.remove();
        }
        move();

        fish.addEventListener("click", () => {
            score += points;
            updateScore();
            animateCatch(fish);
        });
    }

    function animateCatch(fish) {
        // Shrink & fade
        fish.style.transition = "all 0.5s ease";
        fish.style.transform = "scale(0)";
        fish.style.opacity = "0";
        setTimeout(() => fish.remove(), 500);
    }

    // Hook animation
    function spawnHook() {
        const rope = document.createElement("div");
        rope.className = "rope";
        const hook = document.createElement("div");
        hook.className = "hook";
        rope.appendChild(hook);
        board.appendChild(rope);

        let hookY = 0;
        let direction = 1;

        function moveHook() {
            hookY += direction * 2;
            if (hookY > 400) direction = -1;
            if (hookY < 0) direction = 1;
            hook.style.top = hookY + "px";
            requestAnimationFrame(moveHook);
        }
        moveHook();

        // Click hook to catch nearest fish
        hook.addEventListener("click", () => {
            const fishes = document.querySelectorAll(".fish");
            let nearest = null;
            let minDist = Infinity;
            fishes.forEach(f => {
                const rect = f.getBoundingClientRect();
                const hookRect = hook.getBoundingClientRect();
                const dist = Math.abs(rect.top - hookRect.top) + Math.abs(rect.left - hookRect.left);
                if (dist < minDist) {
                    minDist = dist;
                    nearest = f;
                }
            });
            if (nearest) {
                const points = fishData.find(f => nearest.style.backgroundImage.includes(f.src)).points;
                score += points;
                updateScore();
                animateCatch(nearest);
            }
        });
    }

});
