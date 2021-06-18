const mongoose=require('mongoose')
      passportLocalMongoose=require('passport-local-mongoose')
const districtSchema=new mongoose.Schema({
    username:String,
    password:String,
    name:String,
    phone_no:Number,
    email:String,
    patientid:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'Patient'
        }
    ],
    doctorid:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'Doctor'
        }
    ],
    sos_requests:[
        {
            request_time:Date,
            resolved_time:Date,
            patientid:{
                type:mongoose.Schema.Types.ObjectId,
                ref:'Patient'
            },
            status:String,
        }
    ],
    role:{
        type:String,
        default:'DISTRICT'
    }
})
districtSchema.plugin(passportLocalMongoose);
module.exports=new mongoose.model('District',districtSchema)