require('dotenv').config()

// const trivia = require("./trivia")
const express = require('express');
const app = express();
const mysql = require('mysql');
const triviaFunc = require('./api');

const port = process.env.PORT || 3000;

app.use(express.static('.'));

app.set('view engine', 'hbs');

app.get('/', (req, res) => {
    res.render('index');
})

let questionObject;

app.get('/api', async (req, res) =>{

    await triviaFunc(10, 9, "easy", (data)=>{
        console.log(data);
        questionObject = {
            question1: data.results[0],
        }
    });

    let correctAnswer = questionObject.question1.correct_answer;
    let arrayAnswers = [... questionObject.question1.incorrect_answers, questionObject.question1.correct_answer];
    console.log(arrayAnswers);
    arrayAnswers = arrayAnswers.sort(() => Math.random() - 0.5);
    console.log(arrayAnswers);
    console.log(correctAnswer);

    res.render('apiView', {
        question: (questionObject.question1.question),
        answers: arrayAnswers,
    });
});

app.listen(port, () => {
    console.log("[SERVER] Server is running on port " + port);
});
