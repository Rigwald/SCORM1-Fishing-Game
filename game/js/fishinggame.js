// Create the GAME object if it doesn't exist
var GAME = GAME || {};

// Sample configuration loading (GitHub Pages-friendly)
GAME.config = {};

GAME.readConfig = function(callback) {
    // Load design.ini, questions.ini, sounds.ini via AJAX
    // Use relative paths, GitHub Pages supports HTTP(s)
    var files = ["config/design.ini", "config/questions.ini", "config/sounds.ini"];
    var loaded = 0;

    files.forEach(function(file) {
        $.ajax({
            url: file,
            dataType: "text",
            success: function(data) {
                GAME.config[file] = data;
                loaded++;
                if (loaded === files.length) {
                    callback(); // all loaded
                }
            },
            error: function() {
                console.error("Failed to load: " + file);
                loaded++;
                if (loaded === files.length) {
                    callback(); // continue even if errors
                }
            }
        });
    });
};

GAME.init = function() {
    console.log("Initializing game...");

    // Load config first
    GAME.readConfig(function() {
        console.log("Config loaded:", GAME.config);

        // Initialize canvas and game state
        var canvas = document.getElementById("gameCanvas");
        if (!canvas) {
            console.error("Canvas element not found!");
            return;
        }

        GAME.ctx = canvas.getContext("2d");

        // Example: clear screen
        GAME.ctx.fillStyle = "#87ceeb"; // sky blue
        GAME.ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Display "Game Ready"
        GAME.ctx.fillStyle = "#000";
        GAME.ctx.font = "30px Arial";
        GAME.ctx.fillText("Fishing Game Ready!", 200, 300);

        // You can add further game initialization here
    });
};

GAME.start = function() {
    console.log("Starting game...");
    // Main game loop or logic goes here
};
