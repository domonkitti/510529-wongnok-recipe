//----------------ตั้งค่า และนำเข้า--------------------------------
const express = require('express')
const idrouter = express.Router()
const path = require('path')
const Userid = require('../model/user.js')
const multer = require('multer')
const upload = multer()
const bcrypt = require('bcryptjs')
const saltRounds = 10
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const { Console } = require('console')
//---------------------ไปเพจ
idrouter.get("/login",(req,res)=>{
    res.render("login.ejs")
})
idrouter.get("/signup",(req,res)=>{
    res.render("signup.ejs")
})
//--------------------trigger----------------------sign log in logout
idrouter.post("/signup/newidregister", async (req, res) => {//อัพ เมนูใหม่ๆ
    console.log(req.body);
    try {
        let hashedPassword = await bcrypt.hash(req.body.password, saltRounds)
        let documentData = {
            ...req.body,
            password: hashedPassword
        };
        let document = new Userid(documentData);
        console.log(documentData)
        await document.save();
        res.redirect('/');
    } catch (error) {
        console.error("Error during asynchronous operation", error);
        res.render('404', {errorMessage: 'ไอดีซ้ำกับท่านอื่น/เกิดข้อผิดพลาด'})
    }
})
const secretKey = '1234'; // You should store this securely

idrouter.post('/login/userlogingin', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await Userid.findOne({ username });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.render('404', {errorMessage: 'ไอดีหรือพาสเวิดผิด'})
        }
        // Sign a token with user role information
        const token = jwt.sign({ userId: user._id, role: user.role,displayname:user.displayname }, secretKey, { expiresIn: '1h' });
        console.log(`Login: User role is ${user.role}`); // Debug log
        res.cookie('authToken', token, { httpOnly: true, maxAge: 3600000 });
       // console.log("Debug - Secret Key:", secretKey)
       // console.log("Generated JWT for debugging:", token); // For debugging only
        res.redirect('/');
    } catch (error) {
        res.render('404', {errorMessage:(error.message)})
    }
});
idrouter.get("/logout",(req,res)=>{
    res.clearCookie('authToken')
    res.redirect('/')
})
// idrouter.get("/test",(req,res)=>{
//     const userData = req.user
//     res.status(500).render('/404', {
//         errorMessage: 'ให้คะแนนไม่สำเร็จ' // Your error message
// })
// })


module.exports = idrouter