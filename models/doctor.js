const mongoose=require('mongoose')
const doctorSchema=new mongoose.Schema({
    doctorid:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
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
})
module.exports=new mongoose.model('Doctor',doctorSchema)