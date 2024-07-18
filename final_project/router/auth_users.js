const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
  return true;
}

const authenticatedUser = (username,password)=>{ //returns boolean
  let validusers = users.filter((user) => {
    return (user.username === username && user.password === password);
  });
  // Return true if any valid user is found, otherwise false
  return validusers.length > 0; 
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Check if username or password is missing
  if (!username || !password) {
      return res.status(404).json({ message: "Error logging in" });
  }

  // Authenticate user
  if (authenticatedUser(username, password)) {
      // Generate JWT access token
      let accessToken = jwt.sign({
          data: password
      }, 'access', { expiresIn: 60 * 60 });

      console.log(`User : ${username},  generated token: ${accessToken}`);

      // Store access token and username in session
      req.session.authorization = {
          accessToken, username
      }
      return res.status(200).send("User successfully logged in");
  } else {
      return res.status(208).json({ message: "Invalid Login. Check username and password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  
  const book = books[isbn];
  if (!book) return res.status(404).send("Book not found");

  const username = req.session.authorization && req.session.authorization.username; 
  
  if (!username) return res.status(401).send("User not authorized.")

  book["reviews"][username] = review;
  res.status(200).send(`Review "${review}" of the user "${username}" has beed added`);
});


regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (!book) return res.status(404).send("Book not found");

  const username = req.session.authorization && req.session.authorization.username; 
  if (!username) return res.status(401).send("User not authorized.")
  
  const reviews = book["reviews"];

  const review = reviews[username];

  if (!review) return res.status(200).send(`The user "${username}" did not have any review for this book`);

  delete reviews[username];

  res.status(200).send(`The review "${review}" of the user "${username}" has been deleted.`)

});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
