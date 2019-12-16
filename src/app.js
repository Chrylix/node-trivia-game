require('dotenv').config()

const express = require('express');
const app = express();
const mysql = require('mysql');

const port = process.env.PORT || 3000;

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

app.listen(port, () => {
    console.log("[SERVER] Server is running on port " + port);
})