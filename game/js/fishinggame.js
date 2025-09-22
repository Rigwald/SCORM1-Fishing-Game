// ---------------------- DATA ----------------------
const designData = {
    // Example: you can convert fishinggame-design.ini settings here
    question_button_up: "background-color:#4CAF50;color:white;padding:10px;border-radius:5px;",
    question_button_down: "background-color:#45a049;color:white;padding:10px;border-radius:5px;",
    button_up: "background-color:#008CBA;color:white;padding:10px;border-radius:5px;",
    button_down: "background-color:#007bb5;color:white;padding:10px;border-radius:5px);",
    // Add other design variables as needed
};

const questionsData = [
    {
        text: "Catch the first fish!",
        correct_answer: [1],
        answer_1: { text: "Click the red fish", feedback_text: "Correct!" },
        answer_2: { text: "Click the blue fish", feedback_text: "Incorrect!" },
        score: 1
    },
    {
        text: "Catch the second fish!",
        correct_answer: [2],
        answer_1: { text: "Click the green fish", feedback_text: "Incorrect!" },
        answer_2: { text: "Click the yellow fish", feedback_text: "Correct!" },
        score: 1
    }
];

// ---------------------- GAME ----------------------
var game = new function() {
    var instance = this;
    var questionIndex = 0;
    var score = 0;

    this.start = function() {
        questionIndex = 0;
        score = 0;
        $('div.score').html(score);
        instance.showQuestion();
    };

    this.showQuestion = function() {
        if(questionIndex >= questionsData.length){
            instance.showResults();
            return;
        }
        var q = questionsData[questionIndex];
        $('.question-block-wrapper .question-text').html(q.text);
        var choices = "";
        for(var i=1;i<=2;i++){
            choices += `<div class='variant' data-number='${i}'>${q["answer_"+i].text}</div>`;
        }
        $('.question-block-wrapper .question-choose').html(choices);
        $('#game').removeClass('step-5').addClass('step-4 unanswered');

        $('.variant').off('click').on('click', function() {
            $(this).toggleClass('choosed');
        });
    };

    this.confirmAnswer = function() {
        var q = questionsData[questionIndex];
        var chosen = $('.variant.choosed').data('number');
        if(q.correct_answer.includes(chosen)){
            score += q.score;
            $('.question-answered-block div').html(q["answer_"+chosen].feedback_text);
            $('#game').addClass('answered correct');
        } else {
            $('.question-answered-block div').html(q["answer_"+chosen]?.feedback_text || "Incorrect!");
            $('#game').addClass('answered incorrect');
        }
        $('div.score').html(score);
        questionIndex++;
    };

    this.showResults = function() {
        $('#game').removeClass('step-4').addClass('step-5');
        $('.result-block div.description div').html("Your final score: "+score);
    };

    // Button handlers
    $(document).on('click', '#step4confirmbutton', function() { instance.confirmAnswer(); });
    $(document).on('click', '#step4continuebutton', function() { instance.showQuestion(); });
    $(document).on('click', '#step5replaybutton', function() { instance.start(); });
};
