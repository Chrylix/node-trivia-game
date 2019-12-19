require('dotenv').config()
const mysql = require('mysql');

const db = mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USERNAME || 'root',
    password: process.env.MYSQL_PASSWORD ||'password',
    port: process.env.MYSQL_PORT || 3306,
    database: process.env.MYSQL_DBNAME || 'trivia',
})

db.timeout = 0;

db.connect( (error) => {
    if (error) {
        console.log("[ERROR] Failed to connect to the MySQL server!");
        console.log(error);
    } else {
        console.log("[SERVER] MySQL successfully connected.")
    }
})

module.exports = db;