const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();




const doesExist = (username) => {
  // Filter the users array for any user with the same username
  let userswithsamename = users.filter((user) => {
      return user.username === username;
  });
  // Return true if any user with the same username is found, otherwise false
  return userswithsamename.length > 0; 
}

public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Check if both username and password are provided
  if (username && password) {
      // Check if the user does not already exist
      if (!doesExist(username)) {
          // Add the new user to the users array
          users.push({"username": username, "password": password});
          return res.status(200).json({message: "User successfully registered. Now you can login"});
      } else {
          return res.status(404).json({message: "User already exists!"});
      }
  }
  // Return error if username or password is missing
  return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  res.status(200).send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (!book) {
    res.status(404).send("Book not found");
  } else {
    res.status(200).json(book);
  }
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author;

  const bookByAuthor = Object.keys(books).filter((key) => books[key].author === author)
                                       .reduce((obj, key) => {obj[key] = books[key]; return obj}, {});

  if (Object.keys(bookByAuthor).length === 0) return res.status(404).send("Not found");

  res.status(200).send(bookByAuthor);
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title;
  const bookByTitle = Object.keys(books).filter((key) => books[key].title === title)
                                       .reduce((obj, key) => {obj[key] = books[key]; return obj}, {});

  if (Object.keys(bookByTitle).length === 0) return res.status(404).send("Not found");

  res.status(200).send(bookByTitle);
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  
  if (!book) return res.status(404).send("Book not found");

  res.status(200).send(book["reviews"]);
});



public_users.get('/async-books', async (req, res) => {
  try {
      const response = await axios.get('http://localhost:5000/'); 
      res.status(200).json(response.data);
  } catch (error) {
      res.status(500).json({message: "Error fetching books", error: error.message});
  }
});

public_users.get('/async-book/isbn/:isbn', async (req, res) => {
  const isbn = req.params.isbn;
  const book = books[isbn]; 
  if (!book) return res.status(404).send("Book not found");

  try {
      const response = await axios.get(`http://localhost:5000/isbn/${isbn}`); 
      res.status(200).json(response.data);
  } catch (error) {
      res.status(500).json({message: "Error fetching books", error: error.message});
  }
});


public_users.get('/async-book/author/:author', async (req, res) => {
  const author = req.params.author;

  try {
      const response = await axios.get(`http://localhost:5000/author/${author}`); 
      res.status(200).json(response.data);
  } catch (error) {
      res.status(500).json({message: "Error fetching books", error: error.message});
  }
});

public_users.get('/async-book/title/:title', async (req, res) => {
  const title = req.params.title;

  try {
      const response = await axios.get(`http://localhost:5000/title/${title}`); 
      res.status(200).json(response.data);
  } catch (error) {
      res.status(500).json({message: "Error fetching books", error: error.message});
  }
});



module.exports.general = public_users;
