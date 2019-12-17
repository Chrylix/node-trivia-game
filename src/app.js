require('dotenv').config()

// const trivia = require("./trivia")
const express = require('express');
const session = require('express-session');
const app = express();
const db = require('./db');
const bcrypt = require('bcrypt');
const triviaFunc = require('./api');

const saltRounds = 10;
const port = process.env.PORT || 3000;

app.use(express.urlencoded());
app.use(express.static('.'));

var sess = {
    secret: process.env.JWT_KEY,
    cookie: {}
}

app.use(session(sess));

app.set('view engine', 'hbs');

app.get('/', (req, res) => {
    res.render('index');
})

app.get('/login', (req, res) => {
    res.render('login');
    console.log('Warwick Davis has allowed you access, huzzah!');
})

app.get('/register', (req, res) => {
    let oldError = req.session.loginError;
    let hasErrors = false;
    req.session.loginError = null;

    if (oldError != null) {
        hasErrors = true;
    }

    if (req.session.token != null) {
        res.redirect('/');
    }

    if (hasErrors) {
        res.render('register', {
            error: oldError,
        })
    } else {
        res.render('register')
    }
    console.log('Warwick Davis has allowed you to register, play it safe!');
})

app.get('/updatepw', (req, res) => {
    res.render('updatepw');
    console.log('Warwick Davis has decided you can change your password on this occasion...');
})

app.post('/register', (req, res) => {
    console.log("[SERVER] Registration attempt!")
    let sqlQueryEmail = 'SELECT email FROM users WHERE email = ?';
    let sqlQueryUsername = 'SELECT username FROM users WHERE username = ?';

    if (req.body.password.length > 0 && req.body.cPassword.length > 0 && req.body.username.length > 0 && req.body.email.length > 0) {
        if (req.body.password == req.body.cPassword) {
            db.query(sqlQueryEmail, req.body.email, (error, result) => {
                if (error) {
                    console.log("[ERROR] There is an error with the SQL query");
                    console.log(error);
                } else {
                    if (result.length > 0) {
                        console.log("[SERVER] The email address is already in use!")
                        req.session.loginError = "That email address is already in use!";
                        res.redirect('back');
                    } else {
                        db.query(sqlQueryUsername, req.body.username, (error, result) => {
                            if (error) {
                                console.log("[ERROR] There is an error with the SQL query");
                                console.log(error);
                            } else {
                                if (result.length > 0) {
                                    console.log("[SERVER] The username is already in use!")
                                    req.session.loginError = "The username is already in use!";
                                    res.redirect('back');
                                } else {
                                    console.log("[SERVER] All registration checks passed, attempting to add user to database!")

                                    bcrypt.genSalt(saltRounds, function(err, salt) {
                                        bcrypt.hash(req.body.password, salt, function(err, hash) {
                                            let sqlQueryRegister = `INSERT INTO users (username, email, hash) VALUES ('${req.body.username}', '${req.body.email}', '${hash}')`;

                                            db.query(sqlQueryRegister, (error, result) => {
                                                if (error) {
                                                    console.log("[ERROR] There is an error with the SQL query");
                                                    console.log(error);
                                                } else {
                                                    console.log("[SERVER] User added to db!")
                                                    let sqlQueryID = 'SELECT userID FROM users WHERE email = ?';
                                                    res.redirect("/login");
                                                    // db.query(sqlQueryID, req.body.email, (error, result) =>  {
                                                    //     if (error) {
                                                    //         console.log("[ERROR] There is an error with the SQL query")
                                                    //         console.log(error);
                                                    //     } else {
                                                    //         const token = jwt.sign({_id: result[0].userID}, process.env.JWT_KEY)

                                                    //         let sqlQuerySetToken = `UPDATE users SET token = ? WHERE userID = ?`
                                                    //         let data = [token, result[0].userID]

                                                    //         db.query(sqlQuerySetToken, data, (error, result) => {
                                                    //             if (error) {
                                                    //                 console.log("[ERROR] There is an error with the SQL query")
                                                    //                 console.log(error);
                                                    //             } else {
                                                    //                 console.log('[SERVER] Registration successful, redirecting to login')
                                                    //                 res.redirect("/login");
                                                    //             }
                                                    //         });
                                                    //     }
                                                    // });
                                                }
                                            });
                                        });
                                    });
                                }
                            }
                        })
                    }
                }
            })
        } else {
            req.session.loginError = "Please make sure both passwords match!";
            res.redirect('back');
        }
    } else {
        req.session.loginError = "Please don't leave any fields empty!";
        res.redirect('back');
    }
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
