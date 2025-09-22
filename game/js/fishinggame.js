/**
 * Copyright eLearning Brothers LLC 2012 All Rights Reserved
 */
var game = new function () {
    var designFile = "design.ini";
    var questionsFile = "questions.ini";
    var soundsFile = "sounds.ini";

    if (!empty(GAMEPREFIX)) {
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
            iniData+=prepareIni(iniData,standartQuestionPattern);
            questions = parseIni(iniData);
            setOriginalQuestions(questions); defaultQuestionPostProcesor(questions);
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

    var loadStyles = function () {
        instance.loadStyles();
    };
    var bindSounds = function () {
        instance.loadSounds();
    };
    var fillData = function () {
        instance.loadData();
    };

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
        var answeredCount = 0; var correctAnsweredCount = 0;
        var answeredScore = 0;
        for (var k in answers) {
            answeredCount++;
            answeredScore += answers[k];
            correctAnsweredCount+=answersMax[k];
       }
        gameScore = answeredScore;
        instance.onUpdateScore(gameScore);
        instance.updateQuizPercent(answeredScore/correctAnsweredCount);
        instance.updateProgressText();
    }

    this.updateQuizPercent = function(count) {
        statistic.game_percent = (100*statistic.correct_answers/(statistic.incorrect_answers+statistic.correct_answers)).toFixed(0);
        var p = (100*count).toFixed(2);
        totalPercent = (100*count).toFixed(0);
        $('div.game .quiz-percent-value').html(p+"% ");
    };
    this.updateProgressText = function() {
        $('div.game .progress-text').html(questionIndex+" of "+questionCount);
    };

    function startTimer() {
        timerPrev = new Date().getTime();
        timerOn = true;
    }

    function stopTimer() {
        timerOn = false;
    }

    /* -----------------------  GAME FLOW START ------------------------- */

    /* -----------------------  STEP-0 game start, reset all ------------------------- */
    this.start = function () {
		 questions = getOriginalQuestions(); defaultQuestionPostProcesor(questions);
        instance.loadData();
        tRewind(sounds.finish);
        tRewind(sounds.conclusion);
        if (!onlyOneSound) {
            setTimeout(function () {
                tRewind(sounds.start);
                tPlay(sounds.start, PRIORITY_NORMAL);
            }, 10);
        }

        statistic.correct_answers=0;    //every correct answer
        statistic.incorrect_answers=0;  //every incorrect attempt
        statistic.fail_answers=0;       //when all attempts was incorrect
        statistic.questions_time={};
        statistic.questions_answers={};

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

    /* -----------------------  STEP-1 Logo, Splash screen ------------------------- */

    liveFastClick('a.button-game-start-1', function () {
        $('#game').removeClass('step-1').addClass('step-2');
        if (onlyOneSound) {
            tRewind(sounds.start);
            if (web_audio_api_player.init()){
                if (sounds.introduction!=null){
                    tPlay(sounds.start, PRIORITY_NORMAL);
                    if ($('#game').hasClass('step-2')){
                        tRewind(sounds.start, 3, 1);
                        tPlay(sounds.introduction, PRIORITY_NORMAL,4);
                    }
                }
                else {tPlay(sounds.start, PRIORITY_NORMAL);}
            }
            else{
                if (sounds.introduction!=null){
                    tPlay(sounds.introduction, PRIORITY_NORMAL);
                }
                else {tPlay(sounds.start, PRIORITY_NORMAL);}
            }
        } else {
            tRewind(sounds.start);
            if (sounds.introduction!=null){
                tPlay(sounds.introduction, PRIORITY_NORMAL);
            }
        }
    });

    /* -----------------------  STEP-2 Intro to game, it's description ------------------------- */

    /* Choose racer */
    liveFastClick('a#step2continuebutton', function() {

        tRewind(sounds.start);
        tRewind(sounds.introduction);

        $('#game').removeClass('step-2');
        start_time= new Date().getTime();
        questionIndex = 0;
        instance.onQuestionChooseRequired();

    });


    
    this.onQuestionChooseRequired = function() {
        questionIndex++;

        if (empty(questions['q' + questionIndex])) {
            finishGame();
            return;
        }

        $('#game').addClass('step-3').removeClass('step-4');
        tRewind(sounds.start);
        tPlay(sounds.start, PRIORITY_HI);

    };
    /* -----------------------  STEP-3 Questions choosing board ------------------------- */

    /**
     * New question index is set, show it and start timers
      */
    function onQuestionIndexApplied() {
        tRewind(sounds.start);
        if (!empty(questions['q' + questionIndex])) {
            startTimer();
            $('#game').removeClass('step-3');
            questionShow(questionIndex);
        } else {
            finishGame();
        }
    }

    /**
     * On animation end
     */
    $(document).bind('endDraw', function () {
        questionIndex++;
        $('#game').addClass('step-3');
    });

    /**
     * On pressing continue button on question board screen
     */
    liveFastClick('#step3continuebutton', function () {
        onQuestionIndexApplied();
    });

    /**
     * No more questions available, go to finish screen, send score to SCROM
     */
    function finishGame() {
        statistic.full_Time=(new Date().getTime()-start_time);
        $('#game').removeClass('step-3').removeClass('step-4').addClass('step-5');
//        $('div.game .bg-flash').css({'z-index': 10});//commented because need scrolling
        flashBackground('start');

        if (sounds.conclusion!=null){
            tPlay(sounds.conclusion, PRIORITY_NORMAL);
        }
        else {tPlay(sounds.finish, PRIORITY_NORMAL);}

        $('div.result-block div.description div').html("" + value(questions.conclusion_text));
        recalculateScore();
        try {
            SCOSetValue("time", gameTime);
            SCOSetValue("score",totalPercent);
            SCOSetValue("completed", 1);
            SCOCommit();
        } catch (e) {
            console.error("Scorm failed -", e);
        }
        if('undefined' !==  typeof gameloader ){
            gameloader.send_results(statistic);
        }
        $('#animation').fadeOut();
        $(document).trigger('gameFinished',[statistic]);
    }

    /* -----------------------  STEP-4 Answers ------------------------- */

    /**
     * Show question board for index i
     * @param i
     */
    function questionShow(i) {
        $('#game').addClass('step-4');
        var question = questions['q' + i];

        var score = nvl(question.score,1); /* Question score is optional, default 1 per question */
        current_time= (new Date().getTime());
        if (statistic.questions_answers['q' + i] != 0) statistic.questions_time['q' + i] = 0;//reset question time on start/correct/fail (don't reset on incorrect)
        $('#game').data('question', question).data('score', score);

        $('.step-4').removeClass("type-multiple");
        $('.question-block div').html(value(question.text));
        $('.question-choose').html("");

        var correct = value(question.correct_answer).split(',');

        var i = 1;
        var order = [];

        // optionally include eli animbutton and clickalert state when specified by ini settings
        var eliAnimButtonDivOpen = (design.eli_anim_button_enabled) ? "<div class='eli-button'>" : "";
        var eliAnimButtonDivClose = (design.eli_anim_button_enabled) ? "</div>" : "";
        var eliAnimClickAlertDiv = (design.eli_anim_clickalert_enabled) ? "<div class='eli-clickalert'></div>" : "";

        while (!empty(value(question['answer_' + i]))) {
            var variant = $("<div class='variant'>" + eliAnimButtonDivOpen + "<div class='table'><div>" + value(question['answer_' + i]) + "</div></div>" + eliAnimClickAlertDiv + eliAnimButtonDivClose + "</div>");
            variant.data({'correct': false, 'number': i});
            for (var k in correct) {
                if (i == correct[k].trim()) {
                    variant.data('correct', true);
                }
            }
            order[order.length] = variant;
            i++;
        }
        if (questions.randomize_answer_order) {
            order.sort(function () {
                return 0.5 - Math.random()
            });
        }

        for (var k in order) {
            $('div.game .question-choose').append(order[k]);
        }

        if (!empty(question.type)) {
            $('div.game .step-4').addClass("type-" + value(question.type));
        }
        if(!empty(question.audio)) {
            currentQuestionSound = createSound(value(question.audio), true);
            tPlay(currentQuestionSound, PRIORITY_HI);
        } else {
            currentQuestionSound = null;
        }

        $('div.game .question-block-wrapper').removeClass('transparent');
        removeBackgroundApply($('div.game .question-block-wrapper'), question);
        if (!empty(question.image)) {
            var image = value(question.image);
            var removeBackground = true;
            if (!empty(question.removeBackground)) {
                removeBackground |= stringToBoolean(value(question.removeBackground));
            }
            $('div.game .question-block-wrapper>div.question-image').css('background-image', 'url("' + parseImgPath(image, true) + '")');
        } else {
            $('div.game .question-block-wrapper>div.question-image').css('background-image', 'none');
        }
        $('.question-block-wrapper').css({opacity:0}).animate({opacity:1}, 'slow');

        $('#game .step-4').removeClass('answered').addClass('unanswered').removeClass('correct').removeClass('incorrect');
        instance.setupAnimationForQuestion(i);

        // call core helper to init eli sprite anims
        initEliSpriteAnims(design);
    }

    function questionHide(i) {
        instance.onQuestionHide(i);
    }

    /**
     * Question is hidden, do custom actions
     */
    this.onQuestionHide = function(questionI) {
        onQuestionIndexApplied();
    };

    liveFastClick('div.question-choose .variant', function () {
        $(this).toggleClass('choosed');
        answerChanged();
    });

    /**
     * Answer is changed
     */
    var answerChanged = function () {
        if (!$('div.step-4').hasClass('type-multiple')) {
            answerConfirmed();
        }
    };


    liveFastClick('div.unanswered a.button-question-confirm', function () {
        answerConfirmed();
    });

    /**
     * Answer is confirmed
     */
    var answerConfirmed = function () {
        if(currentQuestionSound) {
            tRewind(currentQuestionSound);
        }
        var question = $('#game').data('question');
        var lscore = $('#game').data('score');
        answersMax[questionIndex] = parseInt(lscore);
        statistic.questions_time['q'+questionIndex]+= (new Date().getTime())-current_time;
        var answerIndex = -1;
        var answerNumber = 0;

        var allCorrectRequired = $('div.step-4').hasClass('type-multiple');
        var correct = allCorrectRequired;

        $('div.question-choose').find('.variant').each(function () {

            /* If required all correct answers to be choosed */
            if (allCorrectRequired && $(this).hasClass('choosed') != $(this).data('correct')) {
                correct = false;
            }

            /* If required one correct answers to be choosed */
            if (!allCorrectRequired && $(this).hasClass('choosed') && $(this).data('correct')) {
                correct = true;
            }

            if($(this).hasClass('choosed')) {
                answerIndex=$(this).index();
                answerNumber=$(this).data('number');
            }
        });
        if (correct) {
            stopTimer();

            tRewind(sounds.correct);
            tPlay(sounds.correct, PRIORITY_NORMAL);


            answers[questionIndex] = parseInt(lscore);
            score = parseInt($('div.score').html()) + parseInt(lscore);
            statistic.questions_answers['q' + questionIndex] = 1;
            statistic.correct_answers++;

            $('div.game .question-answered-block div').html((allCorrectRequired) ? value(question.correct_feedback_text) : value(question['answer_' + answerNumber].feedback_text));
            $('#game .step-4').addClass('correct');
        } else {

            tRewind(sounds.incorrect);
            tPlay(sounds.incorrect, PRIORITY_NORMAL);

            answers[questionIndex] = 0;
            statistic.questions_answers['q' + questionIndex] = 0;
            statistic.incorrect_answers++;
            statistic.fail_answers++;

            $('div.game .question-answered-block div').html((allCorrectRequired) ? value(question.incorrect_feedback_text) : value(question['answer_' + answerNumber].feedback_text));

            $('#game .step-4').addClass('incorrect');
        }

        $('#game .step-4').removeClass('unanswered').addClass('answered');

        instance.onAnswerConfirmed(correct, answerIndex);
    };

    /**
     * Answer is confirmed, run custom actions like animations
     * @param correct
     * @param answerIndex
     */
    this.onAnswerConfirmed = function(correct, answerIndex) {
        this.runAnimationToQuestion(questionIndex, {correct: correct, answer: answerIndex});
        $('div.game div.progressbar').each(function(){$(this).find('div:eq('+(questionIndex-1)+')').addClass('answered');});

        if(correct) {
            $('div.game div.progressbar').each(function(){$(this).find('div:eq('+(questionIndex-1)+')').addClass('correct').removeClass('incorrect');});
        } else {
            $('div.game div.progressbar').each(function(){$(this).find('div:eq('+(questionIndex-1)+')').addClass('incorrect');});
        }
    }

    liveFastClick('a.button-question-continue', function () {
        recalculateScore();
        instance.onQuestionChooseRequired();
    });

    /* -----------------------  STEP-5 Results ------------------------- */

    liveFastClick('a.button-result-continue', function () {
        $('#game').removeClass('step-5');
        flashBackground('stop');
        $('div.game .bg-flash').css({'z-index': 0});
        game.resetAnimation();
        game.start();
    });

    /* ----------------- ANIMATIONS ----------------- */

    /**
     * Init canvas
     */
    var hooking = false;
    var hooking_return = false;

    function hookTo(x,y) {
        hooking = true;
        hooking_return=false;
        $('div.game div.board div.rope').css({left: x-10});

        var curY = $('div.game div.board div.rope').position().top;
        var curYPos = curY+500;

        var catchedFish = null;
        $('div.fish-container').each(function() {
           /* Check if catched */
           var fishX = $(this)[0].offsetLeft;
           var fishY = $(this)[0].offsetTop;
           var fishWidth = $(this).children().width();
           var fishHeight = $(this).children().height();
           if(fishX<x && fishX+fishWidth>x && fishY<curYPos && fishY+fishHeight>curYPos) {
               catchedFish = $(this);
           }

        });
        if(catchedFish==null && curYPos<540) {
            $('div.game div.board div.rope').animate({top: curY+20},10,"linear", function() {
                hookTo(x,y);
            });
            return;
        }
        if(catchedFish==null && curYPos>=540) {
                hooking_return=true;
            $('div.game div.board div.rope').animate({top: -420},500,"linear", function() {
                hooking=false;
                hooking_return = false;
            });
            return;
        }
        if(catchedFish!=null) {
            catchedFish.css({top:'auto',left:'auto', 'margin-left': catchedFish.children().height()/2+'px'}).stop().children().removeClass('fish-reverted').addClass('catched');
            //catchedFish.css({top:'auto',left:'auto'}).stop().addClass('catched').removeClass('fish-reverted');
            catchedFish.css({height:catchedFish.children().height(),width:catchedFish.children().width()});
            $('div.game div.board div.rope').append(catchedFish);
            //debugger
            $('div.game div.board div.rope').animate({top: -420},500, function() {
                hooking=false;
                $('div.board div.rope div.fish-container').remove();
                $('.question-fish').css({'background': "url('../"+GAMEPREFIX+"/config/images/fish0"+catchedFish.data('fish_number')+"-big.png')",
                    'background-position':'50% 50%',
                    'background-repeat': 'no-repeat'});
                onQuestionIndexApplied();
            });
            return;
        }
    }
    var old_x = 0;
    var old_y=0;
    this.prepareAnimationFrame = function () {
        $('div.game div.fishes').html("");
        for(var i=0;i<questionCount;i++) {
            var fish = $("<div class='fish'></div>");
            var fish_number =Math.floor(Math.random()*3+1);
            fish.addClass('fish-0'+fish_number);
            if(Math.random()>0.5) {
                fish.addClass('fish-reverted');
            }
            var new_fish= $("<div class='fish-container' data-fish_number="+fish_number+"></div>").append(fish);
            $('div.game div.fishes').append(new_fish);
        }
        clearInterval(timer_for_frame);
        timer_for_frame = setInterval(function(){
            if($('div.fishes').hasClass('frame01')) {
                $('div.fishes').removeClass('frame01').addClass('frame02');
            } else {
                $('div.fishes').removeClass('frame02').addClass('frame01');
        }}, 500);

        /* Fish swim! */

        function swim(el) {
            if(el==null || el.hasClass('catched')) {
               return;
            }
            var from = {x: 720};
            var to = {x: -200};

            if(el.children().hasClass('fish-reverted')) {
                el.children().removeClass('fish-reverted');

            } else {
                el.children().addClass('fish-reverted');
                from.x = -200;
                to.x = 720;
            }

            from.y = el.position().top;
            to.y=Math.random()*420+60;
            var animation_timeout =Math.random()*7000+2000;
            //to.y=Math.max(160, Math.min(parseInt(el.css('top'))+Math.random()*800-300, 500));
            if (navigator.appName == 'Microsoft Internet Explorer'){ //Hate IE. It doesn't support css transition
                el.css({top: from.y, left: from.x}).animate({top: to.y, left: to.x}, animation_timeout);
            } else {
            el.css({top: to.y, left: to.x});}


            setAnimationTimeout(el, animation_timeout);
            setTimeout(function(){
                    swim(el)}
                ,animation_timeout);
            //el.css({top: to.y, left: to.x});
            /*el.css({top: from.y, left: from.x}).animate({top: to.y, left: to.x}, Math.random()*7000+2000, function(){
                swim($(this));
            });*/
        }

        function setAnimationTimeout (to_div, animation_timeout){
            to_div.css({'-webkit-transition-duration':animation_timeout+'ms',
            '-moz-transition-duration': animation_timeout+'ms',
            '-o-transition-duration': animation_timeout+'ms',
            '-ms-transition-duration': animation_timeout+'ms',
            'transition-duration': animation_timeout+'ms'
            });
        }
        $('div.fish-container').each(function() {
           $(this).css({top: Math.random()*500+160});
           swim($(this));
        });

        $('div.board div.rope').css({top: -400});

        $('div.game div.board').unbind('mousemove mouseup');
        $('div.game div.board').css({cursor:'pointer'});
        $('div.game div.board').bind('mousemove', function(e) {
            if(hooking) return;
            var x = e.pageX-$('.game').offset().left;
            var y = e.pageY-$('.game').offset().top;
            $('div.board div.rope').css({left: x-10});
        });
        $('div.game div.board').bind('mouseup', function(e) {
            if(hooking && !hooking_return) return;
            if (!hooking_return){
            var x = old_x = e.pageX-$('div.game').offset().left;
            var y = old_y = e.pageY-$('div.game').offset().top;
            } else {
                $('div.board div.rope').stop();
                var x = old_x;
                var y = old_y;
            }
            hookTo(x-10,y);
        });


    };

    /**
     * Prepare frame for animation
     */
    this.setupAnimationForQuestion = function (i) {

    };
    /**
     * Run animation
     */


    this.runAnimationToQuestion = function (i, data) {

    };

    this.resetAnimation = function () {
        this.prepareAnimationFrame();
        this.runAnimationToQuestion(0);
        $('div.game div.progressbar div').removeClass('answered').removeClass('correct').removeClass('incorrect');
    };

    /* ----------------- TIMER ------------------- */
    this.onTimePassed = function (deltaTime) {
        gameTime+=deltaTime;
        $('div.game div.time').html((timeout/1000-parseFloat(gameTime)/1000).toFixed(1));
        if(timeout && gameTime>timeout) {
            this.onTimeOut();
        }
    };

    this.onTimeOut = function () {
        stopTimer();
        tPlay(sounds.incorrect, PRIORITY_NORMAL);
        finishGame();
    };

    /* ----------------- SCORE ------------------- */
    this.onUpdateScore = function(score) {
        $('div.game div.score').html(score);
    };

    /* -----------------------  GAME FLOW END ------------------------- */



    /* ----------------- GAME SPECIFIC LOADERS ------------------- */
    this.loadStyles = function () {
        applyDefaultStyles(design);

        /* eli sprite anims */
        loadEliSpriteAnimStyles(dynamicCssInstance, design);

        if (!hoverDisable) {
            dynamicCssInstance.addCompiled("div.game .question-choose .variant:hover", design.question_button_over);
            dynamicCssInstance.addCompiled("div.game a.button:hover", design.button_over);
        }

        dynamicCssInstance.addRule("div.game .question-vertical-shift", design['margin_top_for_questions_screen'], "height: $vpx");
        dynamicCssInstance.addRule("div.game .question-feedback-vertical-shift", design['margin_top_for_questions_feedback'], "height: $vpx");

        dynamicCssInstance.addCompiled("div.game div.logo1", design.logo1);
        dynamicCssInstance.addCompiled("div.game div.logo2", design.logo2);
        dynamicCssInstance.addCompiled("div.game div.logo3", design.logo3);

        /*for(var i=1;i<=4;i++) {
            dynamicCssInstance.addRule("div.game .racer-variant-"+i, design['char'+i+'_width'], "width: $vpx");
            dynamicCssInstance.addRule("div.game .racer-variant-"+i, design['char'+i+'_height'], "height: $vpx");
            dynamicCssInstance.addRule("div.game .racer-variant-"+i+" div.marker", design['char'+i+'_dragging_point_X'], "left: $vpx");
            dynamicCssInstance.addRule("div.game .racer-variant-"+i+" div.marker", design['char'+i+'_dragging_point_Y'], "top: $vpx");
            dynamicCssInstance.addRuleForImage("div.game .racer-variant-"+i, design['char'+i+'_image'], "background: url('$v') 0 0 no-repeat;");
            dynamicCssInstance.addRule("div.game div.board .racer-variant-"+i+"", design['char'+i+'_dragging_point_X'], "margin-left: -$vpx");
            dynamicCssInstance.addRule("div.game div.board .racer-variant-"+i+"", design['char'+i+'_dragging_point_Y'], "margin-top: -$vpx");
        }*/
        dynamicCssInstance.addCompiled('div.game .quiz-percent-value', design.quiz_percent_value);

        if(!empty(design.question_screen)) {
            var object = dozerMapper(design.question_screen, ["width", "height", "X", "Y", "padding", "paddingX", "paddingY","margin","marginX","marginY","marginTop","marginBottom","marginLeft","marginRight"]);
            dynamicCssInstance.addCompiled("div.game .vertical  .question-choose-wrapper", object);
            dynamicCssInstance.addCompiled("div.game .vertical  .question-block-wrapper", object);
            dynamicCssInstance.addCompiled("div.game .question-answered-block-wrapper", object);
            if(!empty(object.height)) {
            dynamicCssInstance.addCompiled("div.game .question-fish", object.height, "height: -$vpx");}
        }

        dynamicCssInstance.addCompiled("div.game .step-2-bg", design.background_introduction_page);
        dynamicCssInstance.addCompiled("div.game .step-5-bg", design.background_last_page);

        if(!empty(design.question_choose_wrapper)) {
            dynamicCssInstance.addCompiled("div.game .vertical  .question-choose-wrapper", design.question_choose_wrapper);
        }

        dynamicCssInstance.addCompiled("div.game .question-choose .variant", design.question_button_up);
        dynamicCssInstance.addCompiled("div.game .question-choose .variant:active", design.question_button_down);
        dynamicCssInstance.addCompiled("div.game .question-choose .variant.choosed", design.question_button_selected);
        dynamicCssInstance.addCompiled("div.game a.button", design.button_up);
        dynamicCssInstance.addCompiled("div.game a.button:active", design.button_down);
        if(!empty(design.score_box)) {
            dynamicCssInstance.addCompiled("div.game div.score", design.score_box);
        }
        if(!empty(design.time_box)) {
            dynamicCssInstance.addCompiled("div.game div.time", design.time_box);
        }

        dynamicCssInstance.addCompiled("div.game .vertical .question-answered-block-wrapper", design.question_feedback_box);
        dynamicCssInstance.addCompiled("div.game .question-background", design.question_background);
        dynamicCssInstance.addCompiled("div.game .vertical  .question-block-wrapper", design.question_box);
        var object = dozerMapper(design.question_box, ["width", "height", "X", "Y", "padding", "paddingX", "paddingY"]);
        if(!empty(object.height)) {
            dynamicCssInstance.addCompiled("div.game .question-fish", object.height, "height: -$vpx");}
        dynamicCssInstance.addCompiled("div.game .vertical .question-block-wrapper>div.question-image", object);
        applyDefaultQuestionBoxImage(dynamicCssInstance, design.question_box);

        dynamicCssInstance.addCompiled("div.game .step-2-description", design.description_panel);
        dynamicCssInstance.addCompiled("div.game .result-block-wrapper", design.result_panel);
        dynamicCssInstance.addCompiled("div.game .progressbar", design.progressbar_container);
        dynamicCssInstance.addCompiled("div.game .progressbar>div", design.progressbar_item);

        dynamicCssInstance.addCompiled("div.game .progressbar>div.answered", design.progressbar_answered_item);

        if(design.progressbar_answered_correct_item) {
            dynamicCssInstance.addCompiled("div.game .progressbar>div.answered.correct", design.progressbar_answered_correct_item);
        }
        if( design.progressbar_answered_incorrect_item) {
            dynamicCssInstance.addCompiled("div.game .progressbar>div.answered.incorrect", design.progressbar_answered_incorrect_item);
        }
        dynamicCssInstance.addRule("div.game .step-4.answered.correct .question-answered-block-wrapper h1", design.question_answer_correct_color, "color: $v");
        dynamicCssInstance.addRule("div.game .step-4.answered.incorrect .question-answered-block-wrapper h1", design.question_answer_incorrect_color, "color: $v");

        dynamicCssInstance.addRule("div.game .progressbar>div", design.progressbar_container.spacing, "margin-right: $vpx");
        dynamicCssInstance.addRule("div.game .progressbar>div:last-child", design.progressbar_container.spacing, "margin-right: 0px");

        $('div.game .step-4').addClass('vertical').removeClass('horizontal');


        dynamicCssInstance.addCompiled("div.game #step1continuebutton", design.splash_continuebutton);
        dynamicCssInstance.addCompiled("div.game #step2continuebutton", design.intro_continuebutton);
        dynamicCssInstance.addCompiled("div.game #step3continuebutton", design.questions_continuebutton);
        dynamicCssInstance.addCompiled("div.game #step4continuebutton", design.question_continuebutton);
        dynamicCssInstance.addCompiled("div.game #step4confirmbutton", design.question_confirmbutton);
        dynamicCssInstance.addCompiled("div.game #step5replaybutton", design.results_replaybutton);

        var qCount = 1;
        while (!empty(questions['q' + qCount])) {
            qCount++;
        }
        qCount--;

        var paddingTMP = design.progressbar_container.paddingX || design.progressbar_container.padding || 0;
        var totalWidth = 1*value(design.progressbar_container.width)-qCount*value(design.progressbar_container.spacing) - 2*paddingTMP;
        var elementWidth = Math.floor(totalWidth/qCount);
        dynamicCssInstance.addRule("div.game .progressbar>div", elementWidth, "width: $vpx");

        dynamicCssInstance.addRule("div.game .progressbar>div", design.progressbar_item.width, "width: $vpx");


        dynamicCssInstance.flush();
    };
    this.loadSounds = function () {
        if (questions.introduction_audio != null){
            var media = createSound(questions.introduction_audio, true);

            sounds.introduction = media;
        }
        if (questions.conclusion_audio != null){
            var media = createSound(questions.conclusion_audio, true);

            sounds.conclusion = media;
        }
        if(onlyOneSound) {
            liveFastClick('.game a:not(#step4confirmbutton)', function () {
                tPlay(sounds.select);
            });
            liveFastClick('.game .questions div.question:not(.answered):not(.hasOwnSound)', function () {
                tPlay(sounds.select);
            });
            liveFastClick('.type-multiple .question-choose .variant', function () {
                tPlay(sounds.select);
            });
        } else {
            liveFastClick('.game a, .game .questions div.question:not(.answered), .question-choose .variant', function () {
                tPlay(sounds.select);
            });
            if(!hoverDisable) {
                $('.game a, .game .questions div.question:not(.answered), .question-choose .variant').live('mouseenter', function () {
                    tPlay(sounds.hover);
                });
            }
        }

    };
    this.loadData = function () {
        questions.randomize_question_order = stringToBoolean(questions.randomize_question_order);
        questions.randomize_answer_order = stringToBoolean(questions.randomize_answer_order);
        timeout = nvl(questions.timeout,0) * 1000;

        var i = 1;
        while (!empty(questions['q' + i])) {
            i++;
        }
        var qlength = i - 1;
        if (questions.randomize_question_order) {
            var newQ = [];
            var oldQ = [];
            var i = 1;
            while (!empty(questions['q' + i])) {
                newQ[newQ.length] = questions['q' + i];
                oldQ[oldQ.length] = empty(questions['q' + i].path) ? (((i) * 100 / qlength).toFixed(2) + "%") : questions['q' + i].path;
                i++;
            }

            newQ.sort(function () {
                return 0.5 - Math.random()
            });
            var ql = i;
            for (i = 1; i < ql; i++) {
                questions['q' + i] = newQ[i - 1];
                questions['q' + i].path = oldQ[i - 1];
            }

        }

        /* FILL GAME TEXT */
        $("#step1continuebutton").html("" + value(questions.splash_page_button_continue_text));
        $("#step2continuebutton").html("" + value(questions.intro_page_button_continue_text));
        $("#step4continuebutton").html("" + value(questions.question_page_button_continue_text));
        $("#step4confirmbutton").html("" + value(questions.question_page_button_confirm_text));
        $("#step5replaybutton").html("" + value(questions.result_page_button_replay_text));
        $('div.step-2-description div.description div').html("" + value(questions.introduction_text));
        $('div.step-2-description div.racer-description').html("" + value(questions.introduction_racer_description));

        $('div.result-block h1').html("" + value(questions.conclusion_title));
        $('div.result-block div.description div').html("" + value(questions.conclusion_text));

        var qCount = 1;
        while (!empty(questions['q' + qCount])) {
            qCount++;
        }

        questionCount = defaultCutQuestionCount(questions, questions.questions_displayed_from_count);

        $('div.progressbar').html("");
        for(i=0;i<questionCount;i++) $('div.progressbar').append("<div></div>");

    };
    this.animate_bubble = function(bubble){
        bubble.css({top: 560}).animate({top: -10},Math.random()*7000+2000, function(){
            instance.animate_bubble (bubble);
        });
    }


};

$(document).ready(function () {
    game.readConfig();
    $('.game').css('opacity', 0.1);
});

$(window).load(function () {

});

$(document).bind('gameLoaded', function () {
    var focusAnimate = function($el) {
        $el.css({
            width: '10px',
            height: '10px',
            'margin-left':'-5px',
            'margin-top':'-5px',
            opacity: 0.00
        }).animate({
                width: '20px',
                height: '20px',
                'margin-left':'-10px',
                'margin-top':'-10px',
                opacity: 0.3
            }, 'fast', function() {
                $(this).animate({
                    width: '50px',
                    height: '50px',
                    'margin-left':'-25px',
                    'margin-top':'-25px',
                    opacity: 0.0
                }, 'slow', function() {
                    focusAnimate($(this));
                });
            })
    };
    $('.racer-variant div.marker div').each(function() {
        focusAnimate($(this));
    });

    SCOPreInitialize();
    SCOInitialize();
    $('.game').css('opacity', 1);

        var board_div= $('.board');
        var position=100;
        var delta_position=100;
        for (var i=0; i<5; i++){
        $('<div class="bubble"></div>').appendTo(board_div).css({top: 560, left: position }).animate(({top: -10}), Math.random()*7000+2000, function (){
            game.animate_bubble($(this));
        });
        position+=delta_position;
        }

    game.start();
});