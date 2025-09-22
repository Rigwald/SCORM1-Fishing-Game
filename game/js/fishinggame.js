// Define the GAME object globally
var GAME = (function() {

    var gameConfig = {};

    function empty(obj) {
        return obj === undefined || obj === null || obj === "";
    }

    function readConfig(fileName, callback) {
        // Fetch INI files from GitHub Pages (CORS-safe)
        $.get(fileName)
            .done(function(data) {
                callback(data);
            })
            .fail(function() {
                console.error("Failed to load config file:", fileName);
                callback(null);
            });
    }

    function init() {
        // Example: Load all necessary configs
        readConfig("config/fishinggame-design.ini", function(designData){
            if (!empty(designData)) {
                gameConfig.design = designData;
            }
        });

        readConfig("config/fishinggame-questions.ini", function(questionData){
            if (!empty(questionData)) {
                gameConfig.questions = questionData;
            }
        });

        // Initialize game UI
        setupUI();

        console.log("GAME initialized!");
    }

    function setupUI() {
        var container = $("#gameContainer");
        if (container.length === 0) {
            console.error("Game container not found!");
            return;
        }

        container.html("<p>Welcome to the Fishing Game!</p>");
        container.css({
            width: "800px",
            height: "600px",
            backgroundColor: "#87CEEB", // light blue
            border: "2px solid #000",
            textAlign: "center",
            lineHeight: "600px",
            fontFamily: "Arial, sans-serif",
            color: "#fff"
        });
    }

    return {
        init: init
    };
})();
