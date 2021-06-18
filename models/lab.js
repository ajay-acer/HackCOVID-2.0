const mongoose=require('mongoose')
      passportLocalMongoose=require('passport-local-mongoose')
const labSchema=new mongoose.Schema({
    username:String,
    password:String,
    name:String,
    phone_no:Number,
    email:String,
    role:{
        type:String,
        default:'LAB'
    }
})
labSchema.plugin(passportLocalMongoose);
module.exports=new mongoose.model('Lab',labSchema)