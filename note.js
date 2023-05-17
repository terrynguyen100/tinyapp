const { application } = require("express");

//to set a variable into an key-value pair of a cookie
res.cookie('languageChoice', langId);

//middleware
const morgan = require('morgan');
application.use(morgan, 'dev');

//cookie-parser - a middleware
npm install cookie-parser 


//cookie needs to have a default value
languageChoice = req.cookie.lan || 'en';

//check if user is log in
if (req.cookies.userId)
  res.render('protected');

//clear cookie
res.clearCookie('userId');