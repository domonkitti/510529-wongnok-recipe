const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser')
const express = require('express');

const secretKey = '1234'; // secret key ไม่รู้ว่าถ้าเปลี่ยนจะlogin ได้ไหม

//ตัวแก้ cokie เพื่อเอาไว้ส่งข้อมูลผู้ใช้
function authenticate(req, res, next) {
    //console.log("Cookies: ", req.cookies)
    try {
        const token = req.cookies.authToken;
        const decoded = jwt.verify(token, secretKey);
        //console.log(`Authenticate: Decoded token is`, decoded);
        req.user = decoded;
        //console.log("โค้ดที่ถูกแก้=",decoded)
        next();
    } catch (error) {
        next()
        //res.status(401).send("Please log in to access this page.");
    }
}
//ตัว match roleของผู้ที่loginเข้ามา
function authorize(roles = []) {
    if (!Array.isArray(roles)) {
        roles = [roles];
    }

    return [authenticate, (req, res, next) => {
        //console.log(`Authorize: Required roles are`, roles); // Debug log
        //console.log(`Authorize: Current user role is ${req.user.role}`); // Debug log

        if (roles.length && !roles.includes(req.user.role)) {
            // user's role is not authorized
            return res.status(403).send("แก...ไม่มีสิทธิ");
        }

        // authentication and authorization successful
        next();
    }];
}

module.exports = { authenticate, authorize };
