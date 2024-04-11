//ใช้งาน mongoose
const mongoose = require('mongoose')

// เชื่อม mongo
const dburl = 'mongodb://localhost:27017/foodwebDB'
mongoose.connect(dburl).catch(err => console.log(err));
//ออกแบบ scheema รูปแบบของ document
let foodSchema= mongoose.Schema({
    Name:String,
    Price:Number,
    Image:String,//for link
    Ingredients:String,
    Description:String,
    Score:Number,
    TimeToCook:Number,
    Hardness:Number,
    HowToCook:String,
    Date:String,
    Review:String,
    Author:String

})
//model let Product = mongoose.model("ชื่อ colection",productSchema)
let Recipe = mongoose.model("recipes",foodSchema)
//export model เอาออกไป(ใช้ที่เราเตอ)
module.exports = Recipe
//fสำหรับบันทึกข้อมูล
module.exports.saveRecipe=function(model,document){
    model.save(document)
}