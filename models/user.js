const mongoose=require('mongoose')
      passportLocalMongoose=require('passport-local-mongoose')
const userSchema=new mongoose.Schema({
    username:String,
    password:String,
    name:String,
    phone_no:Number,
    email:String,
    role:String,
    district:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'District'
    }
})
userSchema.plugin(passportLocalMongoose);
module.exports=new mongoose.model('User',userSchema)