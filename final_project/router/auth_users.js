const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => { //returns boolean
  // Returns true when the username is still available (i.e. valid for registration)
  let userswithsamename = users.filter((user) => {
    return user.username === username;
  });
  return userswithsamename.length === 0;
}

const authenticatedUser = (username, password) => { //returns boolean
  // Returns true when a user with this username AND password exists in our records
  let validusers = users.filter((user) => {
    return (user.username === username && user.password === password);
  });
  return validusers.length > 0;
}

/* ------------------------------------------------------------------
   Task 7 : Login as a registered user
   ------------------------------------------------------------------ */
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in. Username and password are required." });
  }

  if (authenticatedUser(username, password)) {
    // Generate a JWT access token and save the credentials in the session
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 * 60 });

    req.session.authorization = {
      accessToken, username
    }

    return res.status(200).json({ message: "User successfully logged in", token: accessToken });
  } else {
    return res.status(401).json({ message: "Invalid Login. Check username and password" });
  }
});

/* ------------------------------------------------------------------
   Task 8 : Add or modify a book review
   ------------------------------------------------------------------ */
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;          // the review is passed as a request query
  const username = req.session.authorization.username;   // username stored in the session

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found for the given ISBN" });
  }

  if (!review) {
    return res.status(400).json({ message: "Review is required as a query parameter" });
  }

  // A review is stored per username, so the same user posting again modifies
  // the existing review, while another user's review is added separately.
  const isModified = books[isbn].reviews.hasOwnProperty(username);
  books[isbn].reviews[username] = review;

  return res.status(200).json({
    message: "The review for the book with ISBN " + isbn + " has been " + (isModified ? "modified" : "added") + " by " + username,
    reviews: books[isbn].reviews
  });
});

/* ------------------------------------------------------------------
   Task 9 : Delete a book review
   ------------------------------------------------------------------ */
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;   // username stored in the session

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found for the given ISBN" });
  }

  // Only the review belonging to the logged in user is deleted
  if (books[isbn].reviews.hasOwnProperty(username)) {
    delete books[isbn].reviews[username];
    return res.status(200).json({
      message: "Review for the book with ISBN " + isbn + " posted by the user " + username + " deleted.",
      reviews: books[isbn].reviews
    });
  } else {
    return res.status(404).json({ message: "No review found for this user on the book with ISBN " + isbn });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
