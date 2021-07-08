const mongoose=require('mongoose')
const doctorSchema=new mongoose.Schema({
    doctorid:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    district:String,
    patientid:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'Patient'
        }
    ],
    noofpatient:{
        type:Number,
        default:0
    }
})
module.exports=new mongoose.model('Doctor',doctorSchema)