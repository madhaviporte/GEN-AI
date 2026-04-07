const mongoose = require('mongoose')


const userSchema = new mongoose.Schema({
    username:{
        type:String,
        unique:[true, "username already taken"],
        require: true,
    },
    email:{
        type:String,
        unique:[true,"Account allready exist with this email address"],
    },

    password:{
   type:String,
   require: true
    }
})

const userModel = mongoose.model('users', userSchema)

module.exports = userModel