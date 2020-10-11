const question = document.getElementById("question");
const choices = Array.from(document.getElementsByClassName("choice-text"));
const progressText = document.getElementById("progressText");
const scoreText = document.getElementById('score');
const progressBarFull = document.getElementById('progressBarFull');
const home = document.getElementById('home');
const game = document.getElementById('game');
const end = document.getElementById('end');

let currentQuestion = {};
let acceptingAnswers = true;
let score = 0;
let questionCounter = 0;
let availableQuestions = [];

let questions = [];

fetch(
    'https://opentdb.com/api.php?amount=10&category=9&difficulty=easy&type=multiple'
)
    .then((res) => {
        return res.json();
    })
    .then((loadedQuestions) => {
        questions = loadedQuestions.results.map((loadedQuestion) => {
            const formattedQuestion = {
                question: loadedQuestion.question,
            };

            const answerChoices = [...loadedQuestion.incorrect_answers];
            formattedQuestion.answer = Math.floor(Math.random() * 4) + 1;
            answerChoices.splice(
                formattedQuestion.answer - 1,
                0,
                loadedQuestion.correct_answer
            );

            answerChoices.forEach((choice, index) => {
                formattedQuestion['choice' + (index + 1)] = choice;
            });

            return formattedQuestion;
        });
        
        startGame();
    })
    .catch((err) => {
        console.error(err);
    });



const correctBonus = 10;
const maxQuestions = 10;

startGame = () => {
    
    
    if (game.style.display === "none") {
        game.style.display = "block";
        home.style.display = "none";
      } else {
        game.style.display = "none";
      }
    questionCounter = 0;
    score = 0;
    availableQuestions = [...questions];
    console.log(availableQuestions);
    getNewQuestion();
    
};

getNewQuestion = () => {

    anime({
        targets: '#game',
        translateX: 200,
        duration: 1000,
        easing: 'linear',
        direction: 'alternate'
    
      });

    if(availableQuestions.length ===0 || questionCounter >= maxQuestions) {
        localStorage.setItem("mostRecentScore", score);
        saveHighScore(); //execute function to show end
    }
    
    questionCounter++;
    progressText.innerText = `Question ${questionCounter}/${maxQuestions}`;

    //update progress bar
    progressBarFull.style.width = `${(questionCounter / maxQuestions) * 100}%`;


    const questionIndex = Math.floor(Math.random() * availableQuestions.length);
    currentQuestion = availableQuestions[questionIndex];
    question.innerText = currentQuestion.question;

    choices.forEach( choice => {
        const number = choice.dataset['number'];
        choice.innerText = currentQuestion['choice' + number];
    });

    availableQuestions.splice(questionIndex, 1);

    acceptingAnswers = true;
};

choices.forEach(choice => {
    choice.addEventListener('click', e => {
        if(!acceptingAnswers) return;

        acceptingAnswers = false;
        const selectedChoice = e.target;
        const selectedAnswer = selectedChoice.dataset["number"];

        const classToApply = 
        selectedAnswer == currentQuestion.answer ? "correct" : "incorrect";

        if (classToApply ==='correct') {
            incrementScore(correctBonus);
        }
        
        selectedChoice.parentElement.classList.add(classToApply);

        setTimeout(() => {
            selectedChoice.parentElement.classList.remove(classToApply);
            getNewQuestion();
        }, 1000);
        
    });
});

incrementScore = num => {
    score += num;
    scoreText.innerText = score;
};

const username = document.getElementById('username');
const saveScoreBtn = document.getElementById('saveScoreBtn');
const finalScore = document.getElementById('finalScore');
const mostRecentScore = localStorage.getItem('mostRecentScore');

const highScores = JSON.parse(localStorage.getItem('highScores')) || [];

const maxHightScores = 5;
console.log(highScores);
finalScore.innerText = mostRecentScore;

username.addEventListener("keyup", () => {
    saveScoreBtn.disabled = !username.value;
}),

saveHighScore = e => {
    if (end.style.display === "none") {
        end.style.display = "block";
        game.style.display = "none";
      } else {
        end.style.display = "none";
      }
    console.log('cliqué');
    e.preventDefault();

    const score = {
        score: Math.floor(Math.random()*100),
        name: username.value
    };
    highScores.push(score);
    highScores.sort( (a,b) => b.score - a.score)
    highScores.splice(5);

    localStorage.setItem('highScores', JSON.stringify(highScores));
    window.location.assign("/");
    console.log(highScores);
};

const highScoresList = document.getElementById('highScoresList');

highScoresList.innerHTML = highScores
  .map(score => {
    return `<li class="high-score">${score.name} - ${score.score}</li>`;
  })
  .join("");
