var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt'); // Used for hashing
var database = require ('../database');


// GET home page.
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express', session: req.session });
});

// Login function to login and check a place's weather
router.post('/login', function(request, response, next){

    var user_email_address = request.body.user_email_address;

    var user_password = request.body.user_password;

    if(user_email_address && user_password){
        var query = `SELECT * FROM user_login WHERE user_email = "${user_email_address}"`;

        database.query(query, [user_email_address], function(error, data){

            if(error) {
                return;
            }

            if(data.length > 0){
                var hashedPassword = data[0].user_password; 

                bcrypt.compare(user_password, hashedPassword, function(error, result) { // Comparing hashed and plaintext value passwords for users to log in
                    if(error) {
                        return;
                    }
                    if (result) {
                        request.session.user_id = data[0].user_id;
                        response.redirect("/");
                    } else {
                        response.send('Incorrect Password')
                    }
                });
            } else {
                response.send('Incorrect email');
            }
        });
    } else {
        response.send('Please Enter Email Address and Password Details');
    }
});

// Logout function
router.get('/logout', function(request, response, next){

    request.session.destroy();

    response.redirect("/");

});

// Register function within the home page
router.post('/register', function(request, response, next){

    var user_email_address = request.body.user_email_address;

    var user_password = request.body.user_password;

    var saltRounds = 1;
    
    bcrypt.genSalt(saltRounds, (error, salt) => { // A salt round before hashing registered users' passwords in the database
        if(error) {
            return;
        }
    
        bcrypt.hash(user_password, salt, (error, hash) => { // Hashing users' passwords in the database when they register
            if(error) {
                return;
            }
            
            console.log('Hashed password: ', hash);

            var checkQuery = `SELECT * FROM user_login WHERE user_email = ?`;
            database.query(checkQuery, [user_email_address], function(error, results, fields){
                if(error) {
                    response.status(500).send('Internal Server Error');
                    return;
                }

                if(results.length > 0) {
                    response.status(400).send('Email already registered');
                    return;
                }

                var registerQuery = `INSERT INTO user_login (user_email, user_password) VALUES (?, ?)`;
                database.query(registerQuery, [user_email_address, hash], function(error, results, fields){
                    if(error) {
                        response.status(500).send('Internal Server Error');
                        return;
                    }
                    response.redirect('/');
                });
            });
        });
    });    
});

module.exports = router;
