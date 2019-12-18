require('dotenv').config()
const mysql = require('mysql');

const db = mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USERNAME || 'root',
    password: process.env.PASSWORD ||'password',
    port: 3306,
    database: process.env.MYSQL_DBNAME || 'trivia',
})

db.connect( (error) => {
    if (error) {
        console.log("[ERROR] Failed to connect to the MySQL server!");
    } else {
        console.log("[SERVER] MySQL successfully connected.")
    }
})

module.exports = db;