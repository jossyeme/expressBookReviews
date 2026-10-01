
const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const BASE_URL = "http://localhost:5000";

const send = (res, data, status = 200) =>
    res.status(status).type('json').send(JSON.stringify(data, null, 4));

/* ---------- Task 7: register ---------- */
public_users.post("/register", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return send(res, { message: "Username and password are required" }, 400);
    }
    if (!isValid(username)) {
        return send(res, { message: "User already exists!" }, 409);
    }
    users.push({ username, password });
    return send(res, { message: "User successfully registered. Now you can login" }, 201);
});

/* ---------- Task 2: all books ---------- */
public_users.get('/', (req, res) => send(res, books));

/* ---------- Task 3: by ISBN ---------- */
public_users.get('/isbn/:isbn', (req, res) => {
    const book = books[req.params.isbn];
    if (!book) return send(res, { message: "Book not found for ISBN " + req.params.isbn }, 404);
    return send(res, book);
});

/* ---------- Task 4: by author ---------- */
public_users.get('/author/:author', (req, res) => {
    const author = req.params.author.toLowerCase();
    const result = Object.keys(books)
        .filter((isbn) => books[isbn].author.toLowerCase() === author)
        .map((isbn) => ({ isbn, ...books[isbn] }));
    if (result.length === 0) return send(res, { message: "No books found for author " + req.params.author }, 404);
    return send(res, { booksbyauthor: result });
});

/* ---------- Task 5: by title ---------- */
public_users.get('/title/:title', (req, res) => {
    const title = req.params.title.toLowerCase();
    const result = Object.keys(books)
        .filter((isbn) => books[isbn].title.toLowerCase() === title)
        .map((isbn) => ({ isbn, ...books[isbn] }));
    if (result.length === 0) return send(res, { message: "No books found for title " + req.params.title }, 404);
    return send(res, { booksbytitle: result });
});

/* ---------- Task 6: reviews ---------- */
public_users.get('/review/:isbn', (req, res) => {
    const book = books[req.params.isbn];
    if (!book) return send(res, { message: "Book not found for ISBN " + req.params.isbn }, 404);
    return send(res, book.reviews);
});

/* ================= Task 11: Axios with Promises / async-await ================= */

// Get all books (Promise callbacks)
const getAllBooks = () => {
    return axios.get(`${BASE_URL}/`)
        .then((response) => response.data)
        .catch((error) => { throw new Error("Unable to retrieve books: " + error.message); });
};

// Get book by ISBN (Promise callbacks)
const getBookByISBN = (isbn) => {
    return axios.get(`${BASE_URL}/isbn/${encodeURIComponent(isbn)}`)
        .then((response) => response.data)
        .catch((error) => { throw new Error("Unable to retrieve book by ISBN: " + error.message); });
};

// Get books by author (async/await)
const getBooksByAuthor = async (author) => {
    try {
        const response = await axios.get(`${BASE_URL}/author/${encodeURIComponent(author)}`);
        return response.data;
    } catch (error) {
        throw new Error("Unable to retrieve books by author: " + error.message);
    }
};

// Get books by title (async/await)
const getBooksByTitle = async (title) => {
    try {
        const response = await axios.get(`${BASE_URL}/title/${encodeURIComponent(title)}`);
        return response.data;
    } catch (error) {
        throw new Error("Unable to retrieve books by title: " + error.message);
    }
};

public_users.get('/async/books', (req, res) => {
    getAllBooks().then((data) => send(res, data)).catch((e) => send(res, { message: e.message }, 500));
});

public_users.get('/async/isbn/:isbn', (req, res) => {
    getBookByISBN(req.params.isbn).then((data) => send(res, data)).catch((e) => send(res, { message: e.message }, 500));
});

public_users.get('/async/author/:author', async (req, res) => {
    try { send(res, await getBooksByAuthor(req.params.author)); }
    catch (e) { send(res, { message: e.message }, 500); }
});

public_users.get('/async/title/:title', async (req, res) => {
    try { send(res, await getBooksByTitle(req.params.title)); }
    catch (e) { send(res, { message: e.message }, 500); }
});


module.exports.general = public_users;