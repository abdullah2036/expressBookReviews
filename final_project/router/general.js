const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Base URL of this same server, used by the Axios calls in Tasks 10-13
const BASE_URL = "http://localhost:5000";

/* ------------------------------------------------------------------
   Promise based helpers (consumed with async/await in Tasks 1-4)
   ------------------------------------------------------------------ */

// Returns a Promise that resolves with the complete list of books
const getAllBooks = () => {
  return new Promise((resolve, reject) => {
    if (books) {
      resolve(books);
    } else {
      reject(new Error("Books list is not available"));
    }
  });
};

// Returns a Promise that resolves with the book matching the given ISBN
const getBookByISBN = (isbn) => {
  return new Promise((resolve, reject) => {
    const book = books[isbn];
    if (book) {
      resolve(book);
    } else {
      reject(new Error("Book not found for the given ISBN"));
    }
  });
};

// Returns a Promise that resolves with all books written by the given author
const getBooksByAuthor = (author) => {
  return new Promise((resolve, reject) => {
    let result = [];
    // Obtain all the keys of the 'books' object
    const isbns = Object.keys(books);
    // Iterate through the books and check if the author matches
    for (const isbn of isbns) {
      if (books[isbn].author.toLowerCase() === author.toLowerCase()) {
        // Return the complete book details for every match
        result.push({
          isbn: isbn,
          author: books[isbn].author,
          title: books[isbn].title,
          reviews: books[isbn].reviews
        });
      }
    }
    if (result.length > 0) {
      resolve(result);
    } else {
      reject(new Error("No books found for the given author"));
    }
  });
};

// Returns a Promise that resolves with all books having the given title
const getBooksByTitle = (title) => {
  return new Promise((resolve, reject) => {
    let result = [];
    // Obtain all the keys of the 'books' object
    const isbns = Object.keys(books);
    // Iterate through the books and check if the title matches
    for (const isbn of isbns) {
      if (books[isbn].title.toLowerCase() === title.toLowerCase()) {
        // Return the complete book details for every match
        result.push({
          isbn: isbn,
          author: books[isbn].author,
          title: books[isbn].title,
          reviews: books[isbn].reviews
        });
      }
    }
    if (result.length > 0) {
      resolve(result);
    } else {
      reject(new Error("No books found for the given title"));
    }
  });
};

/* ------------------------------------------------------------------
   Task 6 : Register a new user
   ------------------------------------------------------------------ */
public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Both username and password must be supplied
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  // The username must not already exist
  if (!isValid(username)) {
    return res.status(409).json({ message: "User already exists!" });
  }

  users.push({ "username": username, "password": password });
  return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

/* ------------------------------------------------------------------
   Task 1 / Task 10 : Get the book list available in the shop
   ------------------------------------------------------------------ */
public_users.get('/', async function (req, res) {
  try {
    const bookList = await getAllBooks();
    return res.status(200).send(JSON.stringify(bookList, null, 4));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

/* ------------------------------------------------------------------
   Task 2 / Task 11 : Get book details based on ISBN
   ------------------------------------------------------------------ */
public_users.get('/isbn/:isbn', async function (req, res) {
  try {
    // Retrieve the ISBN from the request parameters
    const isbn = req.params.isbn;
    const book = await getBookByISBN(isbn);
    return res.status(200).send(JSON.stringify(book, null, 4));
  } catch (error) {
    return res.status(404).json({ message: "Book not found for the given ISBN" });
  }
});

/* ------------------------------------------------------------------
   Task 3 / Task 12 : Get book details based on author
   ------------------------------------------------------------------ */
public_users.get('/author/:author', async function (req, res) {
  try {
    const author = req.params.author;
    const booksbyauthor = await getBooksByAuthor(author);
    return res.status(200).send(JSON.stringify({ booksbyauthor: booksbyauthor }, null, 4));
  } catch (error) {
    return res.status(404).json({ message: "No books found for the given author" });
  }
});

/* ------------------------------------------------------------------
   Task 4 / Task 13 : Get all books based on title
   ------------------------------------------------------------------ */
public_users.get('/title/:title', async function (req, res) {
  try {
    const title = req.params.title;
    const booksbytitle = await getBooksByTitle(title);
    return res.status(200).send(JSON.stringify({ booksbytitle: booksbytitle }, null, 4));
  } catch (error) {
    return res.status(404).json({ message: "No books found for the given title" });
  }
});

/* ------------------------------------------------------------------
   Task 5 : Get book review
   ------------------------------------------------------------------ */
public_users.get('/review/:isbn', function (req, res) {
  // Get the book reviews based on the ISBN provided in the request parameters
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    return res.status(200).send(JSON.stringify(book.reviews, null, 4));
  } else {
    return res.status(404).json({ message: "Book not found for the given ISBN" });
  }
});

/* ==================================================================
   TASKS 10 - 13
   The same four operations implemented with Axios, using
   async/await (Tasks 10-11) and Promise callbacks (Tasks 12-13).
   ================================================================== */

// Task 10 : Get the list of books available in the shop using Axios + async/await
public_users.get('/async/books', async function (req, res) {
  try {
    const response = await axios.get(BASE_URL + "/");
    return res.status(200).send(JSON.stringify(response.data, null, 4));
  } catch (error) {
    return res.status(500).json({ message: "Error fetching the book list" });
  }
});

// Task 11 : Get book details based on ISBN using Axios + async/await
public_users.get('/async/isbn/:isbn', async function (req, res) {
  try {
    const isbn = req.params.isbn;
    const response = await axios.get(BASE_URL + "/isbn/" + isbn);
    return res.status(200).send(JSON.stringify(response.data, null, 4));
  } catch (error) {
    return res.status(404).json({ message: "Book not found for the given ISBN" });
  }
});

// Task 12 : Get book details based on author using Axios + Promise callbacks
public_users.get('/async/author/:author', function (req, res) {
  const author = req.params.author;
  axios.get(BASE_URL + "/author/" + encodeURIComponent(author))
    .then(function (response) {
      return res.status(200).send(JSON.stringify(response.data, null, 4));
    })
    .catch(function (error) {
      return res.status(404).json({ message: "No books found for the given author" });
    });
});

// Task 13 : Get book details based on title using Axios + Promise callbacks
public_users.get('/async/title/:title', function (req, res) {
  const title = req.params.title;
  axios.get(BASE_URL + "/title/" + encodeURIComponent(title))
    .then(function (response) {
      return res.status(200).send(JSON.stringify(response.data, null, 4));
    })
    .catch(function (error) {
      return res.status(404).json({ message: "No books found for the given title" });
    });
});

module.exports.general = public_users;
