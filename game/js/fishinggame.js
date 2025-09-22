/**
 * Copyright eLearning Brothers LLC 2012 All Rights Reserved
 */
var game = new function () {
    var designFile = "design.ini";
    var questionsFile = "questions.ini";
    var soundsFile = "sounds.ini";

    if (typeof GAMEPREFIX !== 'undefined' && GAMEPREFIX !== null && GAMEPREFIX !== '') {
        soundsFile = GAMEPREFIX + "-sounds.ini";
        questionsFile = GAMEPREFIX + "-questions.ini";
        designFile = GAMEPREFIX + "-design.ini";
    }

    var questions;
    var questionCount = 0;
    var design;
    var sounds;
    var validity = -3;
    var instance = this;
    var score = 0;
    var answers = {};
    var questionIndex = 0;
    var timerOn = false;
    var timerPrev = null;
    var timerCount = 0;
    var angle = 0;
    var gameScore = 0;
    var curRacer = {};
    var gameTime = 0;
    var timeout = 0; /* NO TIMEOUT */
    var currentQuestionSound = null;
    var totalPercent = 0;
    var answersMax = {};
    var timer_for_frame = 0;
    var statistic = {};
    var start_time;
    var current_time;

    /* -----------------------  LOADING ------------------------- */

    this.reloadStyles = function () {
        $.get("config/" + designFile, function (iniData) {
            design = parseIni(iniData);
            loadStyles();
        });
    };

    this.readConfig = function () {
        $.get("config/" + questionsFile, function (iniData) {
            iniData += prepareIni(iniData, standartQuestionPattern);
            questions = parseIni(iniData);
            setOriginalQuestions(questions); 
            defaultQuestionPostProcesor(questions);
            validity++;
            if (validity == 0) {
                $(document).trigger('gameLoaded');
            }
        });
        $.get("config/" + designFile, function (iniData) {
            design = parseIni(iniData);
            validity++;
            if (validity == 0) {
                $(document).trigger('gameLoaded');
            }
        });
        $.get("config/" + soundsFile, function (iniData) {
            sounds = parseIni(iniData, function (val) {
                var media = createSound(val);
                return media;
            });
            validity++;
            if (validity == 0) {
                $(document).trigger('gameLoaded');
            }
        });
    };

    var loadStyles = function () { instance.loadStyles(); };
    var bindSounds = function () { instance.loadSounds(); };
    var fillData = function () { instance.loadData(); };

    $(document).bind('gameLoaded', function () {
        loadStyles();
        bindSounds();
        fillData();
        $('div.game').addClass('step-1');
        instance.onGameLoaded();
        setInterval(function () {
            if (timerOn) {
                var newTime = new Date().getTime();
                instance.onTimePassed((newTime - timerPrev));
                timerPrev = newTime;
            }
        }, 100);
    });

    /* -----------------------  FUNCTIONS ------------------------- */

    function recalculateScore() {
        var answeredCount = 0; 
        var correctAnsweredCount = 0;
        var answeredScore = 0;
        for (var k in answers) {
            answeredCount++;
            answeredScore += answers[k];
            correctAnsweredCount += answersMax[k];
        }
        gameScore = answeredScore;
        instance.onUpdateScore(gameScore);
        instance.updateQuizPercent(answeredScore / correctAnsweredCount);
        instance.updateProgressText();
    }

    this.updateQuizPercent = function(count) {
        statistic.game_percent = (100 * statistic.correct_answers / (statistic.incorrect_answers + statistic.correct_answers)).toFixed(0);
        var p = (100 * count).toFixed(2);
        totalPercent = (100 * count).toFixed(0);
        $('div.game .quiz-percent-value').html(p + "% ");
    };
    this.updateProgressText = function() {
        $('div.game .progress-text').html(questionIndex + " of " + questionCount);
    };

    function startTimer() {
        timerPrev = new Date().getTime();
        timerOn = true;
    }
    function stopTimer() { timerOn = false; }

    /* -----------------------  GAME FLOW START ------------------------- */

    this.start = function () {
        questions = getOriginalQuestions(); 
        defaultQuestionPostProcesor(questions);
        instance.loadData();
        tRewind(sounds.finish);
        tRewind(sounds.conclusion);
        if (!onlyOneSound) {
            setTimeout(function () {
                tRewind(sounds.start);
                tPlay(sounds.start, PRIORITY_NORMAL);
            }, 10);
        }

        statistic.correct_answers = 0;   
        statistic.incorrect_answers = 0;  
        statistic.fail_answers = 0;       
        statistic.questions_time = {};
        statistic.questions_answers = {};

        answers = {};
        questionIndex = 0;
        timerCount = 0;
        gameTime = 0;
        gameScore = 0;

        stopTimer();
        $('div.score').html(0);
        $('div.time').html(0);
        $('#game').removeClass('step-0').addClass('step-1');
        $(document).trigger('gameStarted');
    };

    this.onGameLoaded = function () {
        instance.prepareAnimationFrame();
        instance.runAnimationToQuestion(0);
    };

    /* ----------------------- Other game functions remain unchanged ------------------------- */
    /* Your existing code for questionShow, answerConfirmed, animations, etc. stays identical */
    /* ... (rest of the fishinggame.js code as you already have) ... */

};

/* -----------------------  FIX FOR GAME.init() ------------------------- */
var GAME = {
    init: function() {
        if (typeof game !== 'undefined' && typeof game.readConfig === 'function') {
            game.readConfig();
        } else {
            console.error("game object not found. Ensure fishinggame.js loaded correctly.");
        }
    }
};
