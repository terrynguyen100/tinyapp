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
function randomizeUniqueShortURL(urlDatabase) {
  let shortURL = '';
  while (urlDatabase[shortURL] || shortURL === '') {
    shortURL = generateRandomStr(6);
  }
  return shortURL;
}
function randomizeUniqueUserId(users) {
  let userId = '';
  while (users[userId] || userId === '') {
    userId = generateRandomStr(3);
  }
  return userId;
}
function longURLExisted(longURL, urlDatabase) {
  for (let key in urlDatabase) {
    if (urlDatabase[key].longURL === longURL)
      return true;
  }
  return false;
}
function urlsForUser(id, urlDatabase) {
  const filteredURLs = {};
  for (let key in urlDatabase) {
    if (urlDatabase[key].userId === id) {
      filteredURLs[key] = urlDatabase[key];
    }
  }
  return filteredURLs;
}
function emailExisted(email, users) {
  //return false if email not exist in database
  //return the entire user if email exist
  for (let key in users) {
    if (users[key].email === email)
      return users[key];
  }
  return false;
}

module.exports = {
  emailExisted,
  urlsForUser,
  longURLExisted,
  randomizeUniqueUserId,
  randomizeUniqueShortURL  
};