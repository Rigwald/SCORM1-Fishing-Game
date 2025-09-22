// -------------------------------
// Fishing Game JS
// -------------------------------

const game = document.querySelector('.game');
const startButton = document.getElementById('startButton');

// -------------------------------
// Fish and rope configuration
// -------------------------------

const fishData = [
    { name: 'fish-01', width: 119, height: 49, frames: ['config/images/fish01-0.png', 'config/images/fish01-1.png'] },
    { name: 'fish-02', width: 143, height: 65, frames: ['config/images/fish02-0.png', 'config/images/fish02-1.png'] },
    { name: 'fish-03', width: 98, height: 34, frames: ['config/images/fish03-0.png', 'config/images/fish03-1.png'] }
];

const rope = {
    x: 360, // center of board
    y: 0,
    height: 490
};

// -------------------------------
// Sounds
// -------------------------------
const biteSound = new Audio('config/sounds/bite.mp3');
const splashSound = new Audio('config/sounds/splash.mp3');

// -------------------------------
// Start Game
// -------------------------------
startButton.addEventListener('click', function() {
    game.classList.remove('step-0');
    game.classList.add('step-1');
    startGame();
});

function startGame() {
    game.classList.remove('step-1');
    game.classList.add('step-2');

    createFish();
}

// -------------------------------
// Create fish elements
// -------------------------------
function createFish() {
    const board = document.createElement('div');
    board.className = 'board';
    game.appendChild(board);

    fishData.forEach(fish => {
        const fishContainer = document.createElement('div');
        fishContainer.className = 'fish-container';
        fishContainer.style.bottom = '-27px';
        fishContainer.style.left = Math.random() * (720 - fish.width) + 'px';

        const fishDiv = document.createElement('div');
        fishDiv.className = 'fish ' + fish.name;
        fishDiv.style.width = fish.width + 'px';
        fishDiv.style.height = fish.height + 'px';
        fishDiv.style.backgroundImage = `url('${fish.frames[0]}')`;
        fishContainer.appendChild(fishDiv);

        board.appendChild(fishContainer);

        animateFish(fishDiv, fish.frames);
    });
}

// -------------------------------
// Animate fish frames
// -------------------------------
function animateFish(fishDiv, frames) {
    let frame = 0;
    setInterval(() => {
        frame = (frame + 1) % frames.length;
        fishDiv.style.backgroundImage = `url('${frames[frame]}')`;
    }, 500);
}

// -------------------------------
// TODO: Hook movement, catching fish, scoring
// -------------------------------
// You can expand here using your original logic for rope and hook
