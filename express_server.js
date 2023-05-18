const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const bcrypt = require('bcryptjs');
const PORT = 8080;

//---------MIDDLEWARE--------
app.set('view engine', 'ejs');
app.use(cookieParser());
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false })); //extended = true means the cookies can send higher form of variables, instead of just literals

//----------FUNCTION--------
//return a random ${length} chars string (number and/or letter)
function generateRandomStr(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomStr = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomStr += characters.charAt(randomIndex);
  }
  return randomStr;
}
function randomizeUniqueShortURL() {
  let shortURL = '';
  while (urlDatabase[shortURL] || shortURL === '') {
    shortURL = generateRandomStr(6);
  }
  return shortURL;
}
function randomizeUniqueUserId() {
  let userId = '';
  while (users[userId] || userId === '') {
    userId = generateRandomStr(3);
  }
  return userId;
}
function emailExisted(email) {
  //return false if email not exist in database
  //return the entire user if email exist
  for (let key in users) {
    if (users[key].email === email)
      return users[key];
  }
  return false;
}
function longURLExisted(longURL) {
  for (let key in urlDatabase) {
    if (urlDatabase[key].longURL === longURL)
      return true;
  }
  return false;
}
function urlsForUser(id) {
  const filteredURLs = {};
  for (let key in urlDatabase) {
    if (urlDatabase[key].userId === id) {
      filteredURLs[key] = urlDatabase[key];
    }
  }
  return filteredURLs;
}

//--------DATABASE----------------

const urlDatabase = {
  'b2xVn2': {
    longURL: 'https://www.tsn.ca',
    userId: 'aaa',
  },
  'f98k4g': {
    longURL: 'https://www.apple.com',
    userId: 'aaa',
  },
  '9sm5xK': {
    longURL: 'https://www.google.ca',
    userId: 'bbb'
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

//------------------ROUTE HANDLER------------------

app.get('/', (req, res) => {
  const userId = req.cookies['userId'];
  if (userId && users.userId) {
    res.redirect('/urls');
  } 
  else {
    res.redirect('/login');
  }
});

app.get('/urls', (req, res) => {
  const userId = req.cookies['userId'];

  // if (!users[userId]) {
  //   console.log('this userId in cookie does not exist in database. Proceed to clear cookie');
  //   res.clearCookie('userId');
  //   //When server reset, the database is reset. If cookie[userId] does not exist in database, clear the cookie
  // }

  if (userId && users[userId]) {
    const templateVars = {
      urls: urlsForUser(userId), //filter only the urls belong to this cookies[userId]
      user: users[req.cookies['userId']]
    };
    res.render('urls_index', templateVars);
  } else {
    res.send('User is NOT logged in to view the /urls');
  }
});

app.post('/urls', (req, res) => {
  const userId = req.cookies['userId'];
  
  //check for log in status
  if (!userId) { 
    return res.send('User is NOT logged in. Unable to add new URL');
  }
  //check for empty longURL
  if (!req.body.longURL) { 
    return res.status(400).send('URL cannot be empty');
  }
    //checks if longURL already exist
  const longURL = req.body.longURL.trim(); //without trimming, same url with extra spaces are considered as equivalent
  if (longURLExisted(longURL)) { 
    return res.send('Link already exist in database.');
  }
  //add new link to urlDatabase
  const id = randomizeUniqueShortURL();
  urlDatabase[id] = {
    longURL: longURL,
    userId: userId
  };
  console.log(urlDatabase[id]);
  return res.redirect(`urls/${id}`);
});

//urls/new needs to be before urls/:id. Otherwise 'new' will be mistook as :id
app.get('/urls/new', (req, res) => {
  const userId = req.cookies['userId'];

  // if (!users[userId]) {
  //   console.log('this userId in cookie does not exist in database. Proceed to clear cookie');
  //   res.clearCookie('userId');
  //   //When server reset, the database is reset. If cookie[userId] does not exist in database, clear the cookie
  // }

  if (userId && users[userId]) {
    const templateVars = {user: users[userId]};
    return res.render('urls_new', templateVars);
  } 
  else {
    return res.redirect('/login');
  }
});

app.get('/urls/:id', (req, res) => {
  const userId = req.cookies['userId'];
  const urlId = req.params.id;

  //check if user is logged in
  if (!userId) { 
    return res.send('You are NOT logged in');
  }
  //check if entered URL already in database
  if (!urlDatabase[urlId]) {
    return res.send('URL does not exist in the database');
  } 
  //check if logged user is author of this url
  if (urlDatabase[urlId].userId !== userId) { 
    return res.send('You are logged in, but NOT authorized to VIEW this URL.');
  } 
  //passed all checks, show the specific link
  const templateVars = {
    id: urlId,
    longURL: urlDatabase[urlId].longURL,
    user: users[req.cookies['userId']]
  };
  res.render('urls_show', templateVars);
});

//DELETE an URL
app.post('/urls/:id/delete', (req, res) => {
  const userId = req.cookies['userId'];
  const urlId = req.params.id;
  //check if passed urlId exist in database
  if (!urlDatabase[urlId]) {
    return res.send(`/urls/${urlId} does not exist.`);
  } 
  //check if user logged in
  if (!userId) { 
    return res.send('You are NOT logged in to DELETE this URL');
  } 
  //if user logged in, check if user is the author
  if (urlDatabase[urlId].userId !== userId) { 
    return res.send('You are logged in, but NOT authorized to DELETE this URL.');
  } 
  //passed all checked, proceed to delete url record
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect('/urls');
});

//UPDATE an URL
app.post('/urls/:id', (req, res) => {
  const userId = req.cookies['userId'];
  const urlId = req.params.id;
  const longURL = req.body.longURL;

  //check if the input url is empty. Can be replaced by 'required' in HTML
  if (!longURL) {
    return res.status(400).send('URL cannot be empty');
  } 
  //check if passed urlId existed in database
  if (!urlDatabase[urlId]) {
    return res.send(`/urls/${urlId} does not exist.`);
  } 
  //check if user logged in
  if (!userId) { 
    return res.send('You are NOT logged in to UPDATE this URL');
  } 
  //if user logged in, check if user is the author
  if (urlDatabase[urlId].userId !== userId) { 
    return res.send('You are logged in, but NOT authorized to UPDATE this URL.');
  }
  //passed all checked, proceed to update url record
  urlDatabase[urlId].longURL = longURL;
  res.redirect('/urls');
});

//Redirecting to the long URL
app.get('/u/:id', (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;
  if (longURL) {
    return res.redirect(longURL);
  } else {
    return res.send('This URL does not exist in the database');
  }
});

//--------------LOG IN - LOG OUT - REGISTRATION---------------
//LOGIN
app.get('/login', (req, res) => {
  const userId = req.cookies['userId'];

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
    return res.status(400).send('Email and Password cannot be blank!');
  } 
  //check if email existed in database
  const user = emailExisted(email);
  if (!user) {
    return res.status(403).send('403: There is no account registered with this email!');
  }
  //check if password matchs
  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(403).send('403: Email is correct but password do not match');
  }
  //passed all checks, login
  res.cookie('userId', user['userId']);
  res.redirect('/urls');
});

//REGISTER
app.get('/register', (req, res) => {
  const userId = req.cookies['userId'];
  if (userId) {
    return res.redirect('/urls');
  } 
  else {
    const templateVars = {user: users[userId]};
    res.render('register', templateVars);
  }
});

app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  //check if email || password is blank
  if (!email || !password) {
    return res.status(400).send('Email and Password cannot be blank!');
  }
  //check if email already existed in database
  if (emailExisted(email)) {
    return res.status(400).send('This email already used before.');
  } 
  const userId = randomizeUniqueUserId();
  const hashedPass = bcrypt.hashSync(password, 10);
  users[userId] = {
    userId: userId,
    email: email,
    password: hashedPass
  };
  console.log('Added new user: ', users);
  res.cookie('userId', userId);
  res.redirect('/urls');
});

//LOGOUT
app.post('/logout', (req, res) => {
  res.clearCookie('userId');
  res.redirect('/login');
});

//LISTENING
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});