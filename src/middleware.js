require('dotenv').config()
let jwt = require('jsonwebtoken');
const session = require('express-session')

let checkToken = (req, res, next) => {
    console.log("[SERVER] Checking for a JWT token...")

    try {
        let token = req.session.token; 

        if (token) {
            jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
            if (err) {
                console.log("[ERROR] Invalid token given!")
                return res.json({
                success: false,
                message: 'Token is not valid'
                });
            } else {
                console.log("[SERVER] Valid JWT token found!")
                req.decoded = decoded;
                next();
            }
            });
        } else {
            console.log("[SERVER] No JWT token found, redirecting to login!")
            res.redirect("/login");
        }
    } catch (e) {
        console.log("[ERROR] Error retrieving token!");
        return res.json({
            success: false,
            message: 'Auth token is not supplied'
        });
    }
};

module.exports = {
  checkToken: checkToken
}
