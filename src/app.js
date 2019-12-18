require('dotenv').config()

const express = require('express');
const session = require('express-session');
const app = express();
const db = require('./db');
const bcrypt = require('bcrypt');
const triviaFunc = require('./api');
const jwt = require('jsonwebtoken');
const middleware = require('./middleware')
const decode = require('unescape');


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

app.get('/login', (req, res) => {
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
        res.render('login', {
            error: oldError,
        })
    } else {
        res.render('login')
    }
});

app.post('/login', (req,res) => {
    console.log("[SERVER] Login attempt: " + req.body.username)
    let sqlQueryAccount = 'SELECT * FROM users WHERE username = ?';

    if (req.body.username.length > 0 && req.body.password.length > 0) {
        db.query(sqlQueryAccount, req.body.username, (error, result) => {
            if (error) {
                console.log("[ERROR] There is an error with the SQL query");
                console.log(error);
            } else {
                if (result.length > 0) {
                    user = {
                        userID: result[0].userID,
                        email: result[0].email,
                        username: result[0].username,
                        profileImg: result[0].profileImg,
                    }

                    console.log('[SERVER] Account found, checking password...')
                    let hash = result[0].hash;

                    bcrypt.compare(req.body.password, hash, function(err, resp) {
                        if (error) {
                            console.log(error);
                        }

                        if (resp) {
                            console.log("[SERVER] Successful login - preparing new JWT token...")
                            let sqlQueryID = 'SELECT userID FROM users WHERE username = ?';

                            db.query(sqlQueryID, req.body.username, (error, result) => {
                                if (error) {
                                    console.log("[ERROR] There is an error with the SQL query");
                                    console.log(error);
                                } else {
                                    const token = jwt.sign({_id: result[0].userID}, process.env.JWT_KEY)

                                    let sqlQuerySetToken = `UPDATE users SET token = ? WHERE userID = ?`
                                    let data = [token, result[0].userID]

                                    db.query(sqlQuerySetToken, data, (error, result) => {
                                        if (error) {
                                            console.log("[ERROR] There is an error with the SQL query");
                                            console.log(error);
                                        } else {
                                            console.log("[SERVER] JWT token successfully set!")
                                            req.session.token = token;
                                            req.session.user = user;
                                            res.redirect("/");
                                        }
                                    });
                                }
                            });
                        } else {
                            console.log("[SERVER] Incorrect password!")
                            req.session.loginError = "Invalid username/password!";
                            res.redirect("back")
                        }
                    });
    
                } else {
                    console.log("[SERVER] No such email registered!");
                    req.session.loginError = "Invalid username/password!";
                    res.redirect("back")
                }
            }
        })
    } else {
        console.log("[SERVER] User left empty fields!")
        req.session.loginError = "Please do not leave any fields empty!";
        res.redirect("back")
    }
})

app.get('/logout', (req, res) => {
    req.session.user = null;
    req.session.token = null;
    res.redirect("/login");
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
})

app.get('/updatepw', middleware.checkToken, (req, res) => {
    res.render('updatepw');
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
                                                    db.query(sqlQueryID, req.body.email, (error, result) =>  {
                                                        if (error) {
                                                            console.log("[ERROR] There is an error with the SQL query")
                                                            console.log(error);
                                                        } else {
                                                            const token = jwt.sign({_id: result[0].userID}, process.env.JWT_KEY)

                                                            let sqlQuerySetToken = `UPDATE users SET token = ? WHERE userID = ?`
                                                            let data = [token, result[0].userID]

                                                            db.query(sqlQuerySetToken, data, (error, result) => {
                                                                if (error) {
                                                                    console.log("[ERROR] There is an error with the SQL query")
                                                                    console.log(error);
                                                                } else {
                                                                    console.log('[SERVER] Registration successful, redirecting to login')
                                                                    res.redirect("/login");
                                                                }
                                                            });
                                                        }
                                                    });
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

// drop down menu of the categories
let categories = [
    {categoryID: 9, name: "General Knowledge"},
    {categoryID: 10, name:"Entertainment: Books"},
    {categoryID: 11, name:"Film"},
    {categoryID: 12, name:"Music"},
    {categoryID: 15, name:"Video Games"},
    {categoryID: 18, name:"Computers"},
    {categoryID: 22, name:"Geography"},
    {categoryID: 28, name:"Vehicles"},
    {categoryID: 27, name:"Animals"},
    {categoryID: "", name:"Random"}
];

let difficulties = [
    {difficultyGame: "easy", name:"Easy"},
    {difficultyGame: "medium", name:"Medium"},
    {difficultyGame: "hard", name:"Hard"}
]

app.get('/testing', (req,res) =>{
   res.render('choosing', {
        categories: categories,
        difficulties: difficulties
   });
});

let questionObject;

app.get('/', middleware.checkToken, async (req, res) =>{
    try {
        await triviaFunc("", "", "", (data)=>{ 
            questionObject = {
                question1: data.results[0],
            }
        });

        let correctAnswer = await questionObject.question1.correct_answer;
        let arrayAnswers = await [... questionObject.question1.incorrect_answers, questionObject.question1.correct_answer];
        arrayAnswers = arrayAnswers.sort(() => Math.random() - 0.5);

        await res.render('index', {
            question: (await decode(questionObject.question1.question)),
            answers: arrayAnswers,
        });
    } catch (error) {
        console.log(error);
        res.render('index');
    }
});


app.listen(port, () => {
    console.log("[SERVER] Server is running on port " + port);
});