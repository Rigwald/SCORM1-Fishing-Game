/**
 * GitHub-Friendly Fishing Game
 * Converted from original eLearning Brothers 2012 version
 */

// ---------- HELPER FUNCTIONS ----------
function empty(val) {
    return val === undefined || val === null || val === '';
}
function value(val) {
    return empty(val) ? '' : val;
}
function stringToBoolean(str) {
    return ('' + str).toLowerCase() === 'true';
}
function nvl(val, defaultVal) {
    return empty(val) ? defaultVal : val;
}

// ---------- SCORM STUBS ----------
function SCOSetValue(key, val){ console.log("SCOSetValue", key, val); }
function SCOCommit(){ console.log("SCOCommit"); }
function SCOPreInitialize(){}
function SCOInitialize(){}

// ---------- GAME OBJECT ----------
var game = new function() {
    var designFile = "design.json";
    var questionsFile = "questions.json";
    var soundsFile = "sounds.json";

    var questions;
    var design;
    var sounds;
    var questionCount = 0;
    var instance = this;
    var score = 0;
    var questionIndex = 0;
    var timerOn = false;
    var timerPrev = null;
    var gameTime = 0;
    var timeout = 0;

    // ---------- LOAD CONFIG ----------
    this.readConfig = function() {
        $.getJSON("config/questions.json", function(data) {
            questions = data;
            if(!questions.questions_displayed_from_count) questions.questions_displayed_from_count = 1;
            questionCount = questions.questions.length;
            $(document).trigger('gameLoaded');
        });

        $.getJSON("config/design.json", function(data) {
            design = data;
        });

        $.getJSON("config/sounds.json", function(data) {
            sounds = data;
        });
    };

    // ---------- GAME FLOW ----------
    this.start = function() {
        questionIndex = 0;
        score = 0;
        gameTime = 0;
        timeout = nvl(questions.timeout, 0) * 1000;

        $('#game').removeClass().addClass('step-1');
        $(document).trigger('gameStarted');
    };

    this.onQuestionChooseRequired = function() {
        questionIndex++;
        if(questionIndex > questionCount) {
            finishGame();
            return;
        }
        $('#game').removeClass().addClass('step-4'); // Question step
        displayQuestion(questionIndex - 1);
    };

    function displayQuestion(i) {
        var q = questions.questions[i];
        $('#game .question-text').html(value(q.text));
        var container = $('#game .question-choose').empty();
        q.answers.forEach(function(a, idx) {
            var btn = $('<div class="variant">' + value(a.text) + '</div>').data({correct: a.correct});
            container.append(btn);
        });
    }

    // ---------- ANSWER HANDLING ----------
    $(document).on('click', 'div.variant', function() {
        var correct = $(this).data('correct');
        if(correct) score++;
        instance.onQuestionChooseRequired();
    });

    // ---------- TIMER ----------
    this.onTimePassed = function(deltaTime) {
        gameTime += deltaTime;
        if(timeout && gameTime > timeout) this.onTimeOut();
    };
    this.onTimeOut = function() {
        timerOn = false;
        finishGame();
    };

    // ---------- FINISH ----------
    function finishGame() {
        $('#game').removeClass().addClass('step-5'); // Results
        $('#game .score').html(score + "/" + questionCount);
        SCOSetValue("score", score);
        SCOCommit();
    }
};

// ---------- DOCUMENT READY ----------
$(document).ready(function() {
    game.readConfig();
});

// ---------- WINDOW LOAD ----------
$(window).on('load', function() {
    $(document).bind('gameLoaded', function() {
        game.start();
    });
});
