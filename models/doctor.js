const mongoose=require('mongoose')
      passportLocalMongoose=require('passport-local-mongoose')
const doctorSchema=new mongoose.Schema({
    username:String,
    password:String,
    name:String,
    phone_no:Number,
    email:String,
    districtid:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'District'
    },
    patientid:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'Patient'
        }
    ],
    role:{
        type:String,
        default:'DOCTOR'
    }
}) 
doctorSchema.plugin(passportLocalMongoose);
module.exports=new mongoose.model('Doctor',doctorSchema)