const mongoose=require('mongoose')
const districtSchema=new mongoose.Schema({
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
    ]
})
module.exports=new mongoose.model('District',districtSchema)