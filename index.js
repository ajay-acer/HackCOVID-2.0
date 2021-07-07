const express=require('express')
      app=express()
      bodyparser=require('body-parser')
      mongoose=require('mongoose')
      passport=require('passport')
      LocalStrategy=require('passport-local')
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
	next();
});


//////////////////////////// Auth Setup Ends ///////////////////////////////

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
        if(req.user.role==roles.patient && req.params.id==req.user._id){
            Patient.find({patientid:req.params.id},(err,patientdetails)=>{
                if(err) console.log(err)
                else{
                    console.log(patientdetails)
                    res.render("demo",{user:req.user,patientdata:patientdetails})
                } 
            })
            
        }
        else res.sendStatus(401)
    } 
    if(req.params.role==roles.doctor){
       
        if(req.user.role==roles.doctor && req.params.id==req.user._id) res.render("doctorhome")
        else res.sendStatus(401)
    } 
    if(req.params.role==roles.district){
        console.log(req.user.role,req.user._id)
        if(req.user.role==roles.district && req.params.id==req.user._id) res.render("districthome")
        else res.sendStatus(401)
    } 
    if(req.params.role==roles.lab){
        if(req.user.role==roles.lab && req.params.id==req.user._id) res.send("Lab Home Page ")
        else res.sendStatus(401)
    }
})

app.post("/home/PATIENT/:id",(req,res)=>{
    console.log(req.body)
    Patient.findOneAndUpdate({patientid:req.params.id},{$push:{dailydata:req.body.patient.dailydata}},{upsert:true},(err,result)=>{
        if(err) console.log(err)
        else console.log(result)
    })
    res.redirect("/home/PATIENT/"+req.params.id)
})

app.get("/emergency",isLoggedIn,isPatient,(req,res)=>{
    var newRequest={
        request_time:Date.now(),
        patientid:req.user._id,
        status:'Requested'
    }
    District.findOneAndUpdate({district:req.user.district},{$push:{sos_requests:newRequest}},(err,result)=>{
        if(err) console.log(err)
        else res.redirect("/home/PATIENT/"+req.user._id)
    })
})
//////////////////////////// Auth Routes Starts //////////////////////////////
app.get("/login",(req,res)=>{
    res.render("login")
})
app.post("/login",passport.authenticate("local",{
	failureRedirect:"/login",
	}),function(req,res){
        if(req.user.role==roles.patient) res.redirect("/home/"+req.user.role+"/"+req.user._id)
        if(req.user.role==roles.doctor) res.redirect("/home/"+req.user.role+"/"+req.user._id)
        if(req.user.role==roles.district) res.redirect("/home/"+req.user.role+"/"+req.user._id)
        if(req.user.role==roles.lab) res.redirect("/home/"+req.user.role+"/"+req.user._id)
});
app.get("/signup",(req,res)=>{
    res.render("register")
})
app.post("/signup",function(req,res){
    // console.log(req.body)
    var newUser =User({
        username:req.body.username,
        name:req.body.name,
        phone_no:req.body.phone_no,
        email:req.body.email,
        district:req.body.district
    })
	User.register(newUser,req.body.password,function(err,user){
		if(err){
			console.log(err);
			return res.render("reg");
		}
        passport.authenticate("local")(req,res,function(){
            //console.log(req.user)
            res.redirect("/login")
        });
        
	});
})
app.get("/logout",function(req,res){
	req.logout();
	res.redirect("/");
});

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
    res.render("districthome")
})