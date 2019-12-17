require('dotenv').config()

const express = require('express');
const app = express();
const db = require('./db');

const port = process.env.PORT || 3000;

app.set('view engine', 'hbs');

app.get('/', (req, res) => {
    res.render('index');
})

app.listen(port, () => {
    console.log("[SERVER] Server is running on port " + port);
})