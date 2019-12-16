require('dotenv').config()

const express = require('express');
const app = express();
const mysql = require('mysql');

const port = process.env.PORT || 3000;

app.set('view engine', 'hbs');

app.get('/', (req, res) => {
    res.render('index');
})