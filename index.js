const express=require('express')
      app=express()
      bodyparser=require('body-parser')
      mongoose=require('mongoose')
      passport=require('passport')
      LocalStrategy=require('passport-local')
      require('dotenv').config()

app.set("view engine","ejs")
app.use(express.static("public"))
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
      Lab=require('./models/Lab')
//////////////////////////// DB Setuo Ends //////////////////////////////////


//////////////////////////// Auth Setup Starts //////////////////////////////

app.use(require("express-session")({
	secret:process.env.secret,
	resave:false,
	saveUninitialized:false
}));
app.use(passport.initialize());

app.use(passport.session());
passport.use(new LocalStrategy(Patient.authenticate()));
passport.serializeUser(Patient.serializeUser());
passport.deserializeUser(Patient.deserializeUser());
passport.use(new LocalStrategy(Doctor.authenticate()));
passport.serializeUser(Doctor.serializeUser());
passport.deserializeUser(Doctor.deserializeUser());
passport.use(new LocalStrategy(Lab.authenticate()));
passport.serializeUser(Lab.serializeUser());
passport.deserializeUser(Lab.deserializeUser());
passport.use(new LocalStrategy(District.authenticate()));
passport.serializeUser(District.serializeUser());
passport.deserializeUser(District.deserializeUser());

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
  res.redirect("/login")

})

//////////////////////////// Auth Routes Starts //////////////////////////////
app.get("/login",(req,res)=>{
    res.render("login")
})



//////////////////////////// Auth Routes Ends ////////////////////////////////
app.listen(process.env.PORT||3000,()=>{
    console.log("Server started at port 3000")
})

app.get("/signup",(req,res)=>{
    res.render("signup")
})
