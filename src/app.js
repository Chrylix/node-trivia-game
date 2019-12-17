require('dotenv').config()

const express = require('express');
const app = express();
const db = require('./db');
const mysql = require('mysql');
const triviaFunc = require('./api');

const port = process.env.PORT || 3000;

app.use(express.static('.'));

app.set('view engine', 'hbs');

app.get('/', (req, res) => {
    res.render('index');
})

app.get('/login', (req, res) => {
    res.render('login');
    console.log('Warwick Davis has allowed you access, huzzah!');
})

app.get('/register', (req, res) => {
    res.render('register');
    console.log('Warwick Davis has allowed you to register, play it safe!');
})

app.get('/updatepw', (req, res) => {
    res.render('updatepw');
    console.log('Warwick Davis has decided you can change your password on this occasion...');
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
