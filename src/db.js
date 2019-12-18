require('dotenv').config()
const mysql = require('mysql');

const db = mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost',
    user: 'root',
    password: 'password',
    port: 3306,
    database: 'trivia',
})

db.connect( (error) => {
    if (error) {
        console.log("[ERROR] Failed to connect to the MySQL server!");
    } else {
        console.log("[SERVER] MySQL successfully connected.")
    }
})

module.exports = db;