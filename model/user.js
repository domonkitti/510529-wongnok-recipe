//ใช้งาน mongoose
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

// เชื่อม mongo
const dburl = 'mongodb://localhost:27017/foodwebDB'
mongoose.connect(dburl).catch(err => console.log(err));
//ออกแบบ scheema รูปแบบของ document
let idSchema= mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: [true, 'Username must not be same'], // Ensures usernames are unique in the database
      },
    password: {
        type: String,
        required: [true, 'Password is required'],
        // validate: {validator: function(password) {
        //   return password.length >= 8;}}
      },
    role : {
        type:Number
      },
    displayname : {
        type:String,
        required: [true, 'Username is required'],
        unique: [true, 'Username must not be same'],
      },
})
//model let Product = mongoose.model("ชื่อ colection",productSchema)
let Userid = mongoose.model("userids",idSchema)
//export model เอาออกไป(ใช้ที่เราเตอ)
module.exports = Userid
//fสำหรับบันทึกข้อมูล
module.exports.saveUserid=function(model,document){
    model.save(document)
}