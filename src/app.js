require('dotenv').config()

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
    }); // calling the function

    res.render('apiView', {
        question: questionObject.question1.question,
        answer: questionObject.question1.correct_answer,
        incorrectAnswers1:questionObject.question1.incorrect_answers[0],
        incorrectAnswers2:questionObject.question1.incorrect_answers[1],
        incorrectAnswers3:questionObject.question1.incorrect_answers[2]
    });
});

app.listen(port, () => {
    console.log("[SERVER] Server is running on port " + port);
});
