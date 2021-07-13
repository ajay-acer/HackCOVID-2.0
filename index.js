const express=require('express')
      app=express()
      bodyparser=require('body-parser')
      mongoose=require('mongoose')
      passport=require('passport')
      LocalStrategy=require('passport-local')
      nodemailer=require('nodemailer')
      require('dotenv').config()

app.set("view engine","ejs")
app.use(express.static("public"))
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended: true}))

///////////////////////////// DB Setuo Starts ////////////////////////////////

const connectionParams={
    useNewUrlParser:true,
    useCreateIndex: true,
    useUnifiedTopology:true
}
mongoose.connect(process.env.DBURL,connectionParams)
.then( ()=>{
    console.log("Connected")
})
.catch((err)=>{
    console.log("NOT CONNECTED!!")
    console.log(err)
})

const Patient=require('./models/Patient'),
      District=require('./models/District'),
      Doctor=require('./models/Doctor'),
      User=require('./models/User')
//////////////////////////// DB Setuo Ends //////////////////////////////////

//////////////////////////// Flash Setup ///////////////////////////////////

const flash=require('connect-flash')
const cookieParser=require('cookie-parser')
const session=require('express-session')
app.use(cookieParser('keyboard cat'))
app.use(session({cookie:{maxAge:60000}}))
app.use(flash())

/////////////////////////// Flash Setup Ends //////////////////////////////

//////////////////////////// Auth Setup Starts //////////////////////////////

app.use(require("express-session")({
	secret:process.env.secret,
	resave:false,
	saveUninitialized:false
}));
app.use(passport.initialize());

app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req,res,next){
	res.locals.currentUser=req.user;
    res.locals.message=req.flash()
	next();
});


//////////////////////////// Auth Setup Ends ///////////////////////////////

/////////////////////////// Mail Setup Starts //////////////////////////////

let mailTransporter = nodemailer.createTransport({ 
    service: 'gmail', 
    auth: { 
        user: process.env.EMAIL_ID, 
        pass: process.env.PASS
    } 
});
let mailDetails = { 
    from: process.env.EMAIL_ID, 
}; 

app.get("/send",(req, res) => {
    mailDetails.to='adas.24.jp@gmail.com'
    mailDetails.subject='Test'
    mailDetails.message='Test Message'
    console.log(mailDetails)
    mailTransporter.sendMail(mailDetails, function(err, data) { 
        if(err) { 
            console.log('Error Occurs'+err); 
        } else { 
            console.log('Email sent successfully'); 
        } 
    });
})
////////////////////////// Mail Setup Ends ////////////////////////////////


//////////////////////////// Roles ////////////////////////////////////////

const roles ={
    doctor:'DOCTOR',
    patient:'PATIENT',
    district:'DISTRICT',
    lab:'LAB'
}

//////////////////////////// Roles ///////////////////////////////////////
app.get("/",(req,res)=>{
    //seed()
    res.redirect("/login")

})
app.get("/home/:role/:id",isLoggedIn,(req,res)=>{
    if(req.params.role==roles.patient){

        if((req.user.role==roles.patient && req.params.id==req.user._id )|| req.user.role==roles.doctor){

            Patient.find({patientid:req.params.id},(err,patientdetails)=>{
                if(err) console.log(err)
                else{
                    console.log(patientdetails)
                    User.find({$or:[{_id:patientdetails[0].doctorid},{name:patientdetails[0].address.district}]},(err,doctor)=>{
                        if(err) console.log(err)
                        else{
                             console.log('Doctor',doctor)
                             console.log(res.locals.message)
                             res.render("demo",{user:req.user,patientdata:patientdetails,doctor:doctor,message:req.flash("message")})
                        }
                    })
                } 
            })
            
        }
        else res.sendStatus(401)
    } 
    if(req.params.role==roles.doctor){
       
        if(req.user.role==roles.doctor && req.params.id==req.user._id){
            Doctor.find({doctorid:req.user._id},(err,doctor)=>{
                if(err) console.log(err)
                else{
                    User.find({_id:{$in:doctor[0].patientid}},(err,patients)=>{
                        if(err) console.log(err)
                        else {
                            console.log('PAtients',patients)
                            Patient.find({patientid:{$in:doctor[0].patientid}},(err,patientdetails)=>{
                                if(err) console.log(err)
                                else{
                                    console.log('Patient details',patientdetails)
                                    res.render("doctorhome",{user:req.user,doctor:doctor[0],patients:patients,patientdetails:patientdetails})
                                } 
                            })
                            
                        }
                    })
                }
            })
            
        } 
        else res.sendStatus(401)
    } 
    if(req.params.role==roles.district){
        console.log(req.user.role,req.user._id)
        if(req.user.role==roles.district && req.params.id==req.user._id){
            District.find({districtid:req.user._id},(err,district)=>{
                if(err) console.log(err)
                else {
                    //console.log(district[0])
                    User.find({district:district[0].district},(err,users)=>{
                        if(err) console.log(err)
                        else {
                            console.log('Users',users)
                            res.render("districthome",{district:district[0],users:users,user:req.user})
                        }
                    })
                   
                }
            })
            
        } 
        else res.sendStatus(401)
    } 
    if(req.params.role==roles.lab){
        if(req.user.role==roles.lab && req.params.id==req.user._id) res.send("Lab Home Page ")
        else res.sendStatus(401)
    }
})

app.post("/home/PATIENT/:id",isLoggedIn,isPatient,(req,res)=>{
    console.log(req.body)
    Patient.findOneAndUpdate({patientid:req.params.id},{$push:{dailydata:req.body.patient.dailydata}},{upsert:true},(err,result)=>{
        if(err) console.log(err)
        else {
            console.log(result)
            mailDetails.to=req.user.email
            mailDetails.subject='Day-'+req.body.patient.dailydata.day+'-'+req.body.patient.dailydata.time+' Data received'
            mailDetails.text='Sir/Madam '+req.user.name+'\n\nYour data received\n\n Take care ! Stay Safe !'
            console.log(mailDetails)
            mailTransporter.sendMail(mailDetails,(err,mail)=>{
                if(err) console.log(err)
                else {
                    console.log('Mail sent successfully',mail)
                }
            })
            var doctorid=result.doctorid
            User.findOne({_id:doctorid},(err,doctor)=>{
                if(err) console.log(err)
                else {
                    console.log('Respective doctor',doctor)
                    mailDetails.to=doctor.email
                    mailDetails.subject='Day-'+req.body.patient.dailydata.day+'-'+req.body.patient.dailydata.time+' Data received from '+req.user.name
                    mailDetails.text='Dear Dr '+doctor.name+'\n\nData received\n\n Take care ! Stay Safe !'
                    console.log(mailDetails)
                    mailTransporter.sendMail(mailDetails,(err,mail)=>{
                        if(err) console.log(err)
                        else {
                            console.log('Mail sent successfully',mail)
                            req.flash('success','Successfull')
                            res.redirect("/home/PATIENT/"+req.params.id)
                        }
                    })
                }
            })
        }
    })
})

app.post("/emergency",isLoggedIn,isPatient,(req,res)=>{
    var newRequest={
        request_time:Date.now(),
        patientid:req.user._id,
        status:'Requested'
    }
    District.findOneAndUpdate({district:req.user.district},{$push:{sos_requests:newRequest}},(err,result)=>{
        if(err) console.log(err)
        else {
            res.redirect("/home/PATIENT/"+req.user._id)
            User.findOne({_id:result.districtid},(err,districtUser)=>{
                if(err) console.log(err)
                else {
                    console.log(districtUser)
                    mailDetails.to=districtUser.email
                    mailDetails.subject='EMERGENCY!!! from '+ req.user.name
                    mailDetails.text='Dear Sir/Madam\nYou have an emergency request\nRespond Immediately\n Email:'+req.user.email+'\nPhone no:'+req.user.phone_no+'\nName:'+req.user.name
                    console.log(mailDetails)
                    mailTransporter.sendMail(mailDetails,(err,mail)=>{
                        if(err) console.log(err)
                        else {
                            console.log('Mail sent successfully',mail)
                            //res.redirect("/home/PATIENT/"+req.params.id)
                        }
                    })
                    mailDetails.to=req.user.email
                    mailDetails.subject='Emergency SOS request recevied!'
                    mailDetails.text='District Administration will  get in touch with you soon \n All possible effort is being made to shift you to the hospital'
                    console.log(mailDetails)
                    mailTransporter.sendMail(mailDetails,(err,mail)=>{
                        if(err) console.log(err)
                        else {
                            console.log('Mail sent successfully',mail)
                            req.flash('success','Successfull')
                            res.redirect("/home/PATIENT/"+req.params.id)
                        }
                    })
                  
                }
            })
        }
    })
    //send an email notifiaction to district
})

app.get("/emergency/Intouch/:id",isLoggedIn,(req,res) => {
    District.findOneAndUpdate({districtid:req.user._id,sos_requests:{$elemMatch:{patientid:req.params.id}}},{$set:{'sos_requests.$.status':'In touch'}},{new:true},(err,District)=>{
        if(err) console.log(err)
        else{
            console.log(District)
            res.redirect("/home/DISTRICT/"+req.user._id)
        }
    })
})

app.get("/emergency/Resolved/:id",isLoggedIn,(req,res) => {
    District.findOneAndUpdate({districtid:req.user._id,sos_requests:{$elemMatch:{patientid:req.params.id}}},{$set:{'sos_requests.$.status':'Resolved','sos_requests.$.resolved_time':new Date()}},{new:true},(err,District)=>{
        if(err) console.log(err)
        else{
            console.log(District)
            res.redirect("/home/DISTRICT/"+req.user._id)
        }
    })
})

app.get("/extend/:id",isLoggedIn,isDoctor,(req,res)=>{
    Patient.findOneAndUpdate({patientid:req.params.id},[{$set:{enddate:{$add:["$enddate",7* 24 * 60 * 60 * 1000]}}}],{new:true},(err,extendedPatient)=>{
        if(err) console.log(err)
        else{
            User.findOne({_id:extendedPatient.patientid},(err,patientUser)=>{
                if(err) console.log(err)
                else {
                    mailDetails.to=patientUser.email
                    mailDetails.subject='Your quarantine period  has been extended by 7 days'
                    mailDetails.text='Your quaratine period will end on '+extendedPatient.enddate+'\nTake care\nStay Safe'
                    console.log(mailDetails)
                    mailTransporter.sendMail(mailDetails,(err,mail)=>{
                        if(err) console.log(err)
                        else {
                            console.log('Mail sent successfully',mail)
                            //res.redirect("/home/PATIENT/"+req.params.id)
                        }
                    })
                }
            })
            res.redirect("/home/DOCTOR/"+req.user._id)
        } 
    })
    //send email notification to patient
})
app.get("/discharge/:id",isLoggedIn,isDoctor,(req,res)=>{
    Patient.findOneAndUpdate({patientid:req.params.id},{status:'negative'},{new:true},(err,negativePatient)=>{
        if(err) console.log(err)
        else{
            Doctor.findOneAndUpdate({doctorid:req.user._id},{$pull:{patientid:req.params.id},$inc:{noofpatient:-1}},{new:true},(err,negativeDoctor)=>{
                if(err) console.log(err)
                else {
                    User.findOne({_id:negativePatient.patientid},(err,patientUser)=>{
                        if(err) console.log(err)
                        else {
                            mailDetails.to=patientUser.email
                            mailDetails.subject='Congratulations!! You have successfully completed quaratine period'
                            mailDetails.text='You have been discharged\nIf any health  issues dail 108!'+'\nTake care\nStay Safe'
                            console.log(mailDetails)
                            mailTransporter.sendMail(mailDetails,(err,mail)=>{
                                if(err) console.log(err)
                                else {
                                    console.log('Mail sent successfully',mail)
                                    //res.redirect("/home/PATIENT/"+req.params.id)
                                }
                            })
                        }
                    })
                    res.redirect("/home/DOCTOR/"+req.user._id)
                }
                  //send email notification to patient
            })
        }
    })
})
app.post("/review/:id/:day/:time",isLoggedIn,isDoctor,(req,res)=>{
    console.log(req.body.address)
    //res.redirect("/home/PATIENT/"+req.params.id)
    Patient.findOneAndUpdate({patientid:req.params.id,dailydata:{$elemMatch:{day:req.params.day,time:req.params.time}}},{$set:{'dailydata.$.review':req.body.address}},{new:true},(err,reviewdPatient)=>{
        if(err) console.log(err)
        else {
            console.log('review addded',reviewdPatient)
            User.findOne({_id:reviewdPatient.patientid},(err,patientUser)=>{
                if(err) console.log(err)
                else {
                    mailDetails.to=patientUser.email
                    mailDetails.subject='Review from Docotor'
                    mailDetails.text='Log in to the website to check the review'+'\nTake care\nStay Safe'
                    console.log(mailDetails)
                    mailTransporter.sendMail(mailDetails,(err,mail)=>{
                        if(err) console.log(err)
                        else {
                            console.log('Mail sent successfully',mail)
                            //res.redirect("/home/PATIENT/"+req.params.id)
                        }
                    })
                }
            })
            req.flash('success','Successfull')
            res.redirect("/home/PATIENT/"+req.params.id)
              //send email notification to patient
        }
    })
})


//////////////////////////// Auth Routes Starts //////////////////////////////
app.get("/login",(req,res)=>{
    res.render("login")
})
app.post("/login",passport.authenticate("local",{
	failureRedirect:"/login",
    failureFlash:true,
	}),function(req,res){
        req.flash("success","Welcome!")
        if(req.user.role==roles.patient) res.redirect("/home/"+req.user.role+"/"+req.user._id)
        if(req.user.role==roles.doctor) res.redirect("/home/"+req.user.role+"/"+req.user._id)
        if(req.user.role==roles.district) res.redirect("/home/"+req.user.role+"/"+req.user._id)
        if(req.user.role==roles.lab) res.redirect("/home/"+req.user.role+"/"+req.user._id)
});
app.get("/signup",(req,res)=>{
    District.find((err,district)=>{
        if(err) console.log(err)
        else   res.render("register",{district:district}) // array
    })
  
})
app.post("/signup",function(req,res){
    // console.log(req.body)
    var newUser =User({
        username:req.body.username,
        name:req.body.name,
        phone_no:req.body.phone_no,
        email:req.body.email,
        district:req.body.district,
        role:req.body.role
    })
    var role=newUser.role
	User.register(newUser,req.body.password,function(err,user){
		if(err){
			console.log(err);
            req.flash("error",err.message)
			return res.redirect("/signup")
		}
        passport.authenticate("local")(req,res,function(){
            //console.log('user',req.user)
            if(role=="PATIENT"){
                //console.log(role)
                var newPatient=new Patient({patientid:req.user._id,district:req.user.district})
                newPatient.save()
                res.redirect("/signup/2")
            }else if(role=="DOCTOR"){
                var newDoctor=new Doctor({doctorid:req.user._id,district:req.user.district})
                newDoctor.save()
                //Add doctor to district Schema
                District.findOneAndUpdate({district:req.user.district},{$push:{doctorid:req.user._id}},(err,result)=>{
                    console.log('added doctor ',result)
                })
                res.redirect("/login")
            }
            else{
                res.redirect("/login")
            }
        });
    });
    //console.log(role) 
})

app.get("/signup/2",(req,res)=>{
    District.find((err,district)=>{
        if(err) console.log(err)
        else   res.render("signup",{district:district}) // array
    })
})
app.post("/signup/2",(req,res)=>{
    console.log(req.body.patient)
    console.log(req.user)
    req.body.patient.address.district=req.user.district
    req.body.patient.startdate=Date.now()
    req.body.patient.enddate=Date.now()+14* 24 * 60 * 60 * 1000
    Patient.findOneAndUpdate({patientid:req.user._id},req.body.patient,{new:true},(err,upPatient)=>{
        if(err) console.log(err)
        else{
            console.log('Updated PAtient',upPatient)
            //Add patient id to District Schema
            District.findOneAndUpdate({district:req.body.patient.address.district},{$push:{patientid:upPatient.patientid}},{new:true},(err,result)=>{
                if(err) console.log(err)
                else{
                    console.log('Added PAtient to district',result)
                    //Allocate doctor to patient from the same district
                    Doctor.findOneAndUpdate({district:result.district},{$push:{patientid:upPatient.patientid},$inc:{noofpatient:1}},{sort:{noofpatient:1},new:true},(err,doctors)=>{
                        if(err) console.log(err)
                        else{
                            console.log("Alloted doctor to patient",doctors)
                            //Add doctor id to patient Schema
                            Patient.findOneAndUpdate({patientid:upPatient.patientid},{doctorid:doctors.doctorid},{new:true},(err,patient)=>{
                                if(err) console.log(err)
                                else console.log(patient)
                            })
                        }
                    })
                } 
            })
        }
    })
    res.redirect("/login")
    //send an email  notification with doctor details
})

app.get("/logout",function(req,res){
	req.logout();
	res.redirect("/");
});

app.get("/adddistrict",(req,res)=>{
    res.render("district")
})
app.post("/adddistrict",(req,res)=>{
    //console.log(req.body)
    var districtUser=new User({
        username: req.body.username,
        name:req.body.name,
        phone_no:req.body.phone_no,
        email:req.body.email,
        district:req.body.district,
        role:req.body.role
    })
    User.register(districtUser,req.body.password,(err,result)=>{
        if(err){
            console.log(err)
            return res.render("district")
        }
        passport.authenticate("local")(req,res,()=>{
            //console.log(req.user)
            var newDistrict=new District({district:req.user.name,districtid:req.user._id})
            newDistrict.save()
            res.redirect("/adddistrict")
        })
    })
})
//////////////////////////// Auth Routes Ends ////////////////////////////////
app.listen(process.env.PORT||3000,()=>{
    console.log("Server started at port 3000")
})

function seed(){
    var newuser=new District({
        patientid:["60dd9413eccd6105ccc80044"],
        districtid:"60e2b03ebe56e627581eb4e0",
        district:"Udupi"
    })
    newuser.save((err,res)=>{
        if(err) console.log(err)
        else console.log(res)
    })
}
function isLoggedIn(req,res,next){
	if(req.isAuthenticated())
		return next();
	res.redirect("/login");
}
function isPatient(req,res,next){
    if(req.user.role===roles.patient)
        return next();
    res.sendStatus(401)
}
function isDoctor(req,res,next){
    if(req.user.role===roles.doctor)
        return next();
    res.sendStatus(401)
}
function isUser(req,res,next){
    if(req.user._id===req.params.id)
        return next();
    res.sendStatus(401)
}
// app.get("/ajay",isLoggedIn,isDoctor,(req,res)=>{
//     res.render("demo")
// })

// app.post("/ajay",(req,res)=>{
//     console.log(req.body)
//     res.redirect("/ajay")
// })

// function adddate()
// {
//     var startdate=Date.now();
//     console.log(startdate)
//     var enddate=startdate+14
//     console.log(enddate)
//     Patient.findOneAndUpdate({patientid:'60dd9413eccd6105ccc80044'},{startdate:startdate,enddate:enddate},(err,res)=>{
//         if(err) console.log(err)
//         else console.log(res)
//     })
// }
// app.get("/test",(req,res)=>{
//     adddate()
// })

app.get("/register",(req,res)=>{
    res.render("doctor")
})