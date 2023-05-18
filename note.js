// const { application } = require("express");

// //to set a variable into an key-value pair of a cookie
// res.cookie('languageChoice', langId);

// //middleware
// const morgan = require('morgan');
// application.use(morgan, 'dev');

// //cookie-parser - a middleware
// npm install cookie-parser 


// //cookie needs to have a default value
// languageChoice = req.cookie.lan || 'en';

// //check if user is log in
// if (req.cookies.userId)
//   res.render('protected');

// //clear cookie
// res.clearCookie('userId');

// //generate random string with number and char (only lower case)
// Math.random().toString(36).substring(2,5);

// //get rid of cookie parser and switch to cookieSession
// req.cookies.userId => req.session.userId
// res.cookie('userId', 'abc') => req.session.userId = 'abc'
// res.clearCOokie('userId') => req.session = null

// //CURL
// curl -X POST -i example.com --cookie "user_id=20126"