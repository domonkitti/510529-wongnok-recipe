const mongoose = require('mongoose');

const ratingSchema = mongoose.Schema({
    foodid: {
        type: String,
        required: [true, 'Username is required'],
        unique: [false, 'Username must not be same'], // Ensures usernames are unique in the database
      },
    who: {
        type: String,
        required: [true, 'Password is required'],
        unique: [true, 'Username must not be same'], // Ensures usernames are unique in the database
      },
    like : {
        type:String
      },
});
let RandR = mongoose.model('randrs', ratingSchema);
module.exports = RandR
module.exports.saveRandR=function(model,document){
    model.save(document)
}