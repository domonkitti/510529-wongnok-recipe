const express = require('express')
const path = require('path')
const foodrouter = require('./router/foodrout')
const idrouter = require('./router/idrout')
const { authenticate } = require('./router/auth')
const app = express()
const cookieParser = require('cookie-parser')
const { usertrack } = require('./router/usertrack')

global.loggedIn = null

app.use(cookieParser())
app.use(express.json())
app.use(express.static('public'))
app.set('views',path.join(__dirname,'views'))
app.set('view engine','ejs')//บอกนามสกุล
app.use(express.urlencoded({extended:true}))
app.use(authenticate)
app.use(usertrack)
app.use("*",(req,res,next)=>{
    loggedIn=req.decoded
    next()
})

//--------------------พวกนี้อยู่ท้ายๆเลย--------------
app.use(foodrouter)
app.use(idrouter)


app.listen(8080,()=>{
    console.log("เปิดเซิฟ 8080")  
})