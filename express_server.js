const express = require("express");
const app = express();
const cookieParser = require('cookie-parser');
const PORT = 8080;

//This tells the Express app to use EJS as its templating engine
app.set("view engine", "ejs");
app.use(cookieParser());
//before all the routes to
app.use(express.urlencoded({ extended: true }));

//return a random 6 chars string (number and/or letter) that is not already in urlDatabase
function generateUniqueRandomID() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let shortURL = '';

  while (urlDatabase[shortURL] || shortURL === '') {
    shortURL = '';
    for (let i = 0; i < 6; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      shortURL += characters.charAt(randomIndex);
    }
  } 
  return shortURL;
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get( "/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies['username']
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  // the if to check if the input url has already exist in urlDatabase
  if (!Object.values(urlDatabase).includes(req.body.longURL)) {
    const id = generateUniqueRandomID();
    
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
    username: req.cookies['username']
  };
  res.render('urls_new', templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { 
    id: req.params.id, 
    longURL: urlDatabase[req.params.id],
    username: req.cookies['username']
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

app.post("/login", (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect('/urls');
});

app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
});

app.get( "/register", (req, res) => {
  const templateVars = {
    username: req.cookies['username']
  };
  res.render("register", templateVars);
});
// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});