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
        if(req.user.role==roles.patient && req.params.id==req.user._id) res.send("Patient Home Page ")
        else res.sendStatus(401)
    } 
    if(req.params.role==roles.doctor){
        if(req.user.role==roles.doctor && req.params.id==req.user._id) res.send("Doctor Home Page ")
        else res.sendStatus(401)
    } 
    if(req.params.role==roles.district){
        if(req.user.role==roles.district && req.params.id==req.user._id) res.send("District Home Page ")
        else res.sendStatus(401)
    } 
    if(req.params.role==roles.lab){
        if(req.user.role==roles.lab && req.params.id==req.user._id) res.send("Lab Home Page ")
        else res.sendStatus(401)
    }
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
    res.render("reg")
})
app.post("/signup",function(req,res){
	var newUser=new User({
        username:req.body.username,
        role:req.body.role
    });
	User.register(newUser,req.body.password,function(err,user){
		if(err){
			console.log(err);
			return res.render("reg");
		}
		passport.authenticate("local")(req,res,function(){
			res.redirect("/login");
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
    var newuser=new User({
        username:'adarsh',
        password:'adarsh',
        role:'PATIRNT'
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