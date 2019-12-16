require('dotenv').config()

const express = require('express');
const app = express();

const port = process.env.PORT || 3000;

app.use(express.urlencoded());
app.use(express.json());
app.use(express.static('.'));

app.set('view engine', 'hbs');

const db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'password',
    port: 3306,
    database: 'trivia',
})

db.connect( (error) => {
    if (error) {
        console.log(error);
    } else {
        console.log("[SERVER] MySQL successfully connected.")
    }
})

app.get('/', middleware.checkToken, (req, res) => {
    res.render('index');
})