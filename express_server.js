const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const PORT = 8080;

//This tells the Express app to use EJS as its templating engine
app.set('view engine', 'ejs');
app.use(cookieParser());
//before all the routes to
app.use(express.urlencoded({ extended: false })); //extended = true means the cookies can send higher form of variables, instead of just literals

//--------FUNCTION--------
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

function generateRandomShortURL() {
  let shortURL = '';
  while (urlDatabase[shortURL] || shortURL === '') {
    shortURL = generateRandomStr(6);
  }
  return shortURL;
}

function generateRandomUserId() {
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
    date: ''
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
    password: 'aaa',
  },
  bbb: {
    userId: 'bbb',
    email: 'b@b.com',
    password: 'bbb',
  },
};

//------------------ROUTE HANDLER------------------
app.get('/', (req, res) => {
  const userId = req.cookies['userId'];
  if (userId && users.userId) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
  
});

app.get('/urls', (req, res) => {
  const userId = req.cookies['userId'];

  if (!users[userId]) {
    console.log('this userId in cookie does not exist in database. Proceed to clear cookie');
    res.clearCookie('userId');
    //When server reset, the database is reset. If cookie[userId] does not exist in database, clear the cookie
  }

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
  

  if (!userId) { //check for log in status
    res.send('User is NOT logged in. Unable to add new URL');
  } else if (!req.body.longURL) { //check for empty longURL
    res.status(400).send('URL cannot be empty');
  } else {
    const longURL = req.body.longURL.trim(); //without trimming, same url with extra spaces are considered as equivalent
    if (longURLExisted(longURL)) { //checks if longURL already exist
      res.send('Link already exist in database.');
    } else { //add new link to urlDatabase
      const id = generateRandomShortURL();
      urlDatabase[id] = {
        longURL: longURL,
        userId: userId
      };
      console.log(urlDatabase[id]);
      res.redirect(`urls/${id}`);
    }
  }
});



//this route needs to be above /urls/:id because if put below, Express
// will think that new is a route paramter
app.get('/urls/new', (req, res) => {
  const userId = req.cookies['userId'];

  if (!users[userId]) {
    console.log('this userId in cookie does not exist in database. Proceed to clear cookie');
    res.clearCookie('userId');
    //When server reset, the database is reset. If cookie[userId] does not exist in database, clear the cookie
  }

  if (userId && users[userId]) {
    const templateVars = {
      user: users[userId]
    };
    res.render('urls_new', templateVars);
  } else {
    res.redirect('/login');
  }
});

app.get('/urls/:id', (req, res) => {
  const userId = req.cookies['userId'];
  const urlId = req.params.id;

  if (!userId) { //if user not logged in, userId = undefined
    res.send('You are NOT logged in');
  } else if (!urlDatabase[urlId]) {
    res.send('The URL for this given ID does not exist');
  } else if (urlDatabase[urlId].userId !== userId) { //if user is not the author of this urls/:id => block access
    res.send('You are logged in, but NOT authorized to VIEW the full URL.');
  } else {
    const templateVars = {
      id: urlId,
      longURL: urlDatabase[urlId].longURL,
      user: users[req.cookies['userId']]
    };
    res.render('urls_show', templateVars);
  }
});

//DELETE
app.post('/urls/:id/delete', (req, res) => {
  const userId = req.cookies['userId'];
  const urlId = req.params.id;

  if (!urlDatabase[urlId]) {
    res.send(`/urls/${urlId} does not exist.`);
  } else if (!userId) { //if user not logged in = userId = undefined
    res.send('You are NOT logged in to DELETE this URL');
  } else if (urlDatabase[urlId].userId !== userId) { //if user is not the author of this urls/:id => block access
    res.send('You are logged in, but NOT authorized to DELETE this URL.');
  } else {
    const id = req.params.id;
    delete urlDatabase[id];
    res.redirect('/urls');
  }
});

//UPDATE
app.post('/urls/:id', (req, res) => {
  const userId = req.cookies['userId'];
  const urlId = req.params.id;

  if (!urlDatabase[urlId]) {
    res.send(`/urls/${urlId} does not exist.`);
  } else if (!userId) { //if user not logged in = userId = undefined
    res.send('You are NOT logged in to UPDATE this URL');
  } else if (urlDatabase[urlId].userId !== userId) { //if user is not the author of this urls/:id => block access
    res.send('You are logged in, but NOT authorized to UPDATE this URL.');
  } else if (!req.body.longURL) {
    res.status(400).send('URL cannot be empty');
  } else {
    const id = req.params.id;
    const longURL = req.body.longURL;
    urlDatabase[id].longURL = longURL;
    res.redirect('/urls');
  }
  
});

//to redirect to the long URL
app.get('/u/:id', (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;
  if (longURL) {
    res.redirect(longURL);
  } else {
    res.send('This URL does not exist in the database');
  }
});

// //to view the json file of all links
// app.get('/urls.json', (req, res) => {
//   res.json(urlDatabase);
// });

//--------------LOG IN - LOG OUT - REGISTRATION---------------
app.get('/login', (req, res) => {

  const userId = req.cookies['userId'];
  if (userId) { //if logged in
    res.redirect('/urls');
  } else { //if NOT logged in
    //this templateVars is serving an undefined user for the _header to load
    //can also put user: undefined but must pass templateVars to render
    const templateVars = {
      user: users[userId]
    };
    res.render('login', templateVars);
  }
});
app.get('/register', (req, res) => {
  const userId = req.cookies['userId'];
  if (userId) {
    res.redirect('/urls');
  } else {
    const templateVars = {
      user: users[userId]
    };
    res.render('register', templateVars);
  }
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    res.status(400).send('Email and Password cannot be blank!');
  } else {
    const user = emailExisted(email);
    if (!user) {
      res.status(403).send('403: There is no account registered with this email!');
    } else if (user.password !== password) {
      res.status(403).send('403: Email is correct but wrong password!');
    } else {
      res.cookie('userId', user['userId']);
      res.redirect('/urls');
    }
  }
});

app.post('/logout', (req, res) => {
  res.clearCookie('userId');
  res.redirect('/login');
});



//when click Register button on /register
app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    res.status(400).send('Email and Password cannot be blank!');
  } else if (emailExisted(email)) {
    res.status(400).send('This email already used before.');
  } else {
    const userId = generateRandomUserId();
    users[userId] = {
      userId: userId,
      email: email,
      password: password
    };
    console.log(users);
    res.cookie('userId', userId);
    res.redirect('/urls');
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});