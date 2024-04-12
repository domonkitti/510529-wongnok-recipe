const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser')
const express = require('express');
const { render } = require('ejs');


// Ensure you have your secretKey defined here or imported from your configuration.
// For example, if you're using dotenv, you might load it like this:
// require('dotenv').config();
// const secretKey = process.env.SECRET_KEY;
const secretKey = '1234'; // Replace this with your actual secret key

function usertrack(req, res, next) {
    //console.log("Cookies: ", req.cookies)
    try {
        const token = req.cookies.authToken;
        const decoded = jwt.verify(token, secretKey);
        //console.log(`Authenticate: Decoded token is`, decoded);
        req.user = decoded;
        //console.log("โค้ดที่ถูกแก้=",decoded)
        render
        next();
    } catch (error) {
        next()
        //res.status(401).send("Please log in to access this page.");
    }
}


module.exports = { usertrack };
