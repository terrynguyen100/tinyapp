const express = require('express');
const app = express();
const cookieSession = require('cookie-session');
const morgan = require('morgan');
const bcrypt = require('bcryptjs');
const PORT = 8080;

//------FUNCTION-----
const {
  emailExisted,
  urlsForUser,
  longURLExisted,
  randomizeUniqueUserId,
  randomizeUniqueShortURL,
} = require('./helpers');

//---------MIDDLEWARE--------
app.set('view engine', 'ejs');
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(cookieSession({
  name: 'notMyCookie',
  keys: ['SuP3r$ecr3tC0dE!']
}));


//--------DATABASE----------------

const urlDatabase = {
  'b2xVn2': {
    longURL: 'https://www.tsn.ca',
    userId: 'aaa',
    createdDate: "1999-19-01",
    visitNumber: 0
  },
  'f98k4g': {
    longURL: 'https://www.apple.com',
    userId: 'aaa',
    createdDate: "1999-19-01",
    visitNumber: 0
  },
  '9sm5xK': {
    longURL: 'https://www.google.ca',
    userId: 'bbb',
    createdDate: "1999-19-01",
    visitNumber: 0
  },
};

const users = {
  aaa: {
    userId: 'aaa',
    email: 'a@a.com',
    password: bcrypt.hashSync('aaa', 10)
  },
  bbb: {
    userId: 'bbb',
    email: 'b@b.com',
    password: bcrypt.hashSync('bbb', 10)
  },
};

const errors = {
  a401: { errorCode: 401, errorMessage: 'Unauthorized. User is not logged in.'},
  a404: { errorCode: 404, errorMessage: 'This URL is not in your collection'},
  b404: { errorCode: 404, errorMessage: 'This short URL is invalid'},
}

let currentError = null;
//------------------ROUTE HANDLER------------------

app.get('/', (req, res) => {
  const userId = req.session['userId'];
  if (userId && users.userId) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

app.get('/urls', (req, res) => {
  const userId = req.session['userId'];
  if (userId && users[userId]) {
    const templateVars = {
      urls: urlsForUser(userId, urlDatabase),
      user: users[req.session['userId']]
    };
    res.render('urls_index', templateVars);
  } else {
    currentError = 'a401';
    return res.redirect('/error');
  }
});

app.post('/urls', (req, res) => {
  const userId = req.session['userId'];
  
  //check for log in status
  if (!userId) {
    return res.status(401).send('User is not logged in.')
  }
  //check for empty longURL
  if (!req.body.longURL) {
    return res.status(400).send('URL cannot be empty.');
  }
  //checks if longURL already exist
  //without trimming, same url with extra spaces are considered as equivalent
  const longURL = req.body.longURL.trim();
  if (longURLExisted(longURL, urlsForUser(userId, urlDatabase))) {
    return res.send('This URL is already in your collection.');
  }
  //add new link to urlDatabase
  const id = randomizeUniqueShortURL(urlDatabase);
  urlDatabase[id] = {
    longURL: longURL,
    userId: userId,
    createdDate: new Date().toJSON().slice(0, 10),
    visitNumber: 0
  };
  return res.redirect(`urls/${id}`);
});

//urls/new needs to be before urls/:id. Otherwise 'new' will be mistook as :id
app.get('/urls/new', (req, res) => {
  const userId = req.session['userId'];

  if (userId && users[userId]) {
    const templateVars = {user: users[userId]};
    return res.render('urls_new', templateVars);
  } else {
    return res.redirect('/login');
  }
});

app.get('/urls/:id', (req, res) => {
  const userId = req.session['userId'];
  const urlId = req.params.id;

  //check if user is logged in
  if (!userId) {
    currentError = 'a401';
    return res.redirect('/error');
  }
  //check if entered URL already in database
  if (!urlDatabase[urlId]) {
    currentError = 'a404';
    return res.redirect('/error');
  }
  //check if logged user is author of this url
  if (urlDatabase[urlId].userId !== userId) {
    currentError = 'a404';
    return res.redirect('/error');
  }
  //passed all checks, show the specific link
  const templateVars = {
    id: urlId,
    longURL: urlDatabase[urlId].longURL,
    createdDate: urlDatabase[urlId].createdDate,
    visitNumber: urlDatabase[urlId].visitNumber,
    user: users[userId]
  };
  res.render('urls_show', templateVars);
});

//DELETE an URL
app.post('/urls/:id/delete', (req, res) => {
  const userId = req.session['userId'];
  const urlId = req.params.id;
  //check if passed urlId exist in database
  if (!urlDatabase[urlId]) {
    return res.send(`The URL is not in your collection.`);
  }
  //check if user logged in
  if (!userId) {
    return res.send('You are not logged in to perform this Delete.');
  }
  //if user logged in, check if user is the author
  if (urlDatabase[urlId].userId !== userId) {
    return res.send('You are logged in, but NOT authorized to delete this URL.');
  }
  //passed all checked, proceed to delete url record
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect('/urls');
});

//UPDATE an URL
app.post('/urls/:id', (req, res) => {
  const userId = req.session['userId'];
  const urlId = req.params.id;
  const longURL = req.body.longURL.trim();

  //check if the input url is empty. Can be replaced by 'required' in HTML
  if (!longURL) {
    return res.status(400).send('The URL cannot be empty.');
  }
  //check if passed urlId existed in database
  if (!urlDatabase[urlId]) {
    return res.send(`The URL is not in your collection.`);
  }
  //check if user logged in
  if (!userId) {
    return res.send('You are not logged in to perform this Update.');
  }
  //if user logged in, check if user is the author
  if (urlDatabase[urlId].userId !== userId) {
    return res.send('You are logged in, but NOT authorized to update this URL.');
  }
  //check if the input link already exist in this user's database
  if (longURLExisted(longURL, urlsForUser(userId, urlDatabase))) {
    return res.send('This URL is already in your database.');
  }
  //passed all checked, proceed to update url record
  urlDatabase[urlId].longURL = longURL;
  res.redirect('/urls');
});

//Redirecting to the long URL
app.get('/u/:id', (req, res) => {
  const urlID = req.params.id;
  if (urlDatabase[urlID] == undefined) {
    currentError = 'b404';
    return res.redirect('/error');
  }

  let longURL = urlDatabase[req.params.id].longURL;
  urlDatabase[req.params.id].visitNumber++;
  return res.redirect(longURL);
});

//--------------LOG IN - LOG OUT - REGISTRATION---------------
//LOGIN
app.get('/login', (req, res) => {
  const userId = req.session['userId'];

  //check if user logged in
  if (userId) {
    return res.redirect('/urls');
  }
  const templateVars = {user: users[userId]};
  return res.render('login', templateVars);
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  
  //check if email || password is blank
  if (!email || !password) {
    return res.status(400).send('Email and Password cannot be empty.');
  }
  //check if email existed in database
  const user = emailExisted(email, users);
  if (!user) {
    return res.status(403).send('403: There is no account registered with this email.');
  }
  //check if password matchs
  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(403).send('403: Email is correct but password do not match');
  }
  //passed all checks, login
  req.session['userId'] = user['userId'];
  //res.cookie('userId', user['userId']);
  res.redirect('/urls');
});

//REGISTER
app.get('/register', (req, res) => {
  const userId = req.session['userId'];
  if (userId) {
    return res.redirect('/urls');
  } else {
    const templateVars = {user: users[userId]};
    res.render('register', templateVars);
  }
});

app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  //check if email || password is blank
  if (!email || !password) {
    return res.status(400).send('Email and Password cannot be empty.');
  }
  //check if email already existed in database
  if (emailExisted(email, users)) {
    return res.status(400).send('This email is already associated with another account.');
  }
  const userId = randomizeUniqueUserId(users);
  const hashedPass = bcrypt.hashSync(password, 10);
  users[userId] = {
    userId: userId,
    email: email,
    password: hashedPass
  };
  req.session['userId'] = userId;
  // res.cookie('userId', userId);
  res.redirect('/urls');
});

//LOGOUT
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});

//ERROR
app.get('/error', (req, res) => {
  const templateVars = {
    errorCode: errors[currentError].errorCode,
    errorMessage: errors[currentError].errorMessage
  }
  res.render('error', templateVars);
});

//LISTENING
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});