// const express = require('express');
// const jwt = require('jsonwebtoken');
// let books = require("./booksdb.js");
// const regd_users = express.Router();

// let users = [];

// const isValid = (username)=>{ //returns boolean
// //write code to check is the username is valid
// }

// const authenticatedUser = (username,password)=>{ //returns boolean
// //write code to check if username and password match the one we have in records.
// }

// //only registered users can login
// regd_users.post("/login", (req,res) => {
//   //Write your code here
//   return res.status(300).json({message: "Yet to be implemented"});
// });

// // Add a book review
// regd_users.put("/auth/review/:isbn", (req, res) => {
//   //Write your code here
//   return res.status(300).json({message: "Yet to be implemented"});
// });

// module.exports.authenticated = regd_users;
// module.exports.isValid = isValid;
// module.exports.users = users;


const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const send = (res, data, status = 200) =>
    res.status(status).type('json').send(JSON.stringify(data, null, 4));

// true if the username is valid and not already taken
const isValid = (username) => {
    return typeof username === 'string' && username.trim() !== '' &&
        !users.some((u) => u.username === username);
};

const authenticatedUser = (username, password) => {
    return users.some((u) => u.username === username && u.password === password);
};

// Task 8: login
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return send(res, { message: "Username and password are required" }, 400);
    }
    if (!authenticatedUser(username, password)) {
        return send(res, { message: "Invalid login. Check username and password" }, 401);
    }
    const accessToken = jwt.sign({ data: username }, 'access', { expiresIn: 60 * 60 });
    req.session.authorization = { accessToken, username };
    return send(res, { message: "Login successfull!", username: username, status: "Registered user logged in" });
});

// Task 9: add or modify a review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review;
    const username = req.session.authorization.username;

    if (!books[isbn]) {
        return send(res, { message: "Book not found for ISBN " + isbn }, 404);
    }
    if (!review) {
        return send(res, { message: "Please provide a review in the query string" }, 400);
    }
    books[isbn].reviews[username] = review;
    return send(res, {
        message: "Review for ISBN " + isbn + " by " + username + " added/updated successfully",
        reviews: books[isbn].reviews
    });
});

// Task 10: delete the logged-in user's review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization.username;

    if (!books[isbn]) {
        return send(res, { message: "Book not found for ISBN " + isbn }, 404);
    }
    if (!books[isbn].reviews[username]) {
        return send(res, { message: "No review by " + username + " found for ISBN " + isbn }, 404);
    }
    delete books[isbn].reviews[username];
    return send(res, {
        message: "Review for ISBN " + isbn + " by " + username + " deleted successfully",
        reviews: books[isbn].reviews
    });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;