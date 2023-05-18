const express = require("express");
const app = express();
const cookieParser = require('cookie-parser');
const PORT = 8080;

//This tells the Express app to use EJS as its templating engine
app.set("view engine", "ejs");
app.use(cookieParser());
//before all the routes to
app.use(express.urlencoded({ extended: true }));

//--------FUNCTION--------
//return a random ${length} chars string (number and/or letter)
function generateRandomStr (length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomStr = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomStr += characters.charAt(randomIndex);
  }
  return randomStr;
}

function generateRandomShortURL () {
  let shortURL = '';
  while (urlDatabase[shortURL] || shortURL === '') {
    shortURL = generateRandomStr(6);
  }
  return shortURL; 
};

function generateRandomUserId () {
  let userId = '';
  while (users[userId] || userId === '') {
    userId = generateRandomStr(3);
  }
  return userId; 
};

function emailExisted (email) {
  //return false if email not exist in database
  //return the entire user if email exist
  for (let key in users) {
    if (users[key].email === email)
      return users[key];
  }
  return false;
}

//--------DATABASE----------------
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  aaa: {
    id: "aaa",
    email: "a@a.com",
    password: "aaa",
  },
  bbb: {
    id: "bbb",
    email: "b@b.com",
    password: "bbb",
  },
};

//------------------ROUTE------------------
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get( "/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: req.cookies['user']
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  // the if to check if the input url has already exist in urlDatabase
  if (!Object.values(urlDatabase).includes(req.body.longURL)) {
    const id = generateRandomShortURL();
    
    urlDatabase[id] = req.body.longURL;
    res.redirect(`urls/${id}`);
  } else {
    res.send('Link already exist in database. Go back.');
  }
});



//this route needs to be above /urls/:id because if put below, Express
// will think that new is a route paramter
app.get('/urls/new', (req, res) => {
  const templateVars = {
    user: req.cookies['user']
  };
  res.render('urls_new', templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { 
    id: req.params.id, 
    longURL: urlDatabase[req.params.id],
    user: req.cookies['user']
  };
  res.render("urls_show", templateVars);
});

//DELETE
app.post('/urls/:id/delete', (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect('/urls');
});


//UPDATE
app.post('/urls/:id/update', (req, res) => {
  const id = req.params.id;
  const longURL = req.body.longURL;
  urlDatabase[id] = longURL;
  res.redirect('/urls');
});

//to redirect to the long URL
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  //BUG: longURl has to has http:// or https://. If not, redirect too many times error will show
  res.redirect(longURL);
});

//to view the json file of all links
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//--------------LOG IN - LOG OUT - REGISTRATION---------------
app.get("/login", (req, res) => {
  templateVars = {
    user: req.cookies['user']
  };

  res.render('login', templateVars);
});

// app.post("/login", (req, res) => {
//   const email = req.body.email;
//   const password = req.body.password;

//   if (!email || !password) {
//     res.status(400).send('Email and Password cannot be blank!');
//   } else {
//     const user = emailExisted(email);
//     if (!user) {
//       //wrong email
//       res.status(401).send('401: There is no account registered with this email!');
//     } else if (user.password !== password) {
//         res.status(401).send('401: Email is correct but wrong password!');
//     } else {
//         res.cookie('user', user);
//     }
//   }
//   //res.cookie('email', req.body.email);
//   res.redirect('/urls');
// });

app.post("/logout", (req, res) => {
  res.clearCookie('user');
  res.redirect('/urls');
});

app.get( "/register", (req, res) => {
  const templateVars = {
    user: req.cookies['user']
  };
  res.render("register", templateVars);
});

//when click Register button on /register
app.post( "/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
      res.status(400).send('Email and Password cannot be blank!');
  } else if (emailExisted(email)){
      res.status(400).send('This email already used before.');
  } else {
      const userId = generateRandomUserId();
      users[userId] = {
        id: userId,
        email: email,
        password: password
      }
      res.cookie('user', users[userId]);
      res.redirect("/urls");
  }
});

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});