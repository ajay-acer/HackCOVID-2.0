const express=require('express')
      app=express()
      bodyparser=require('body-parser')
      mongoose=require('mongoose')
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

//////////////////////////// DB Setuo Ends //////////////////////////////////

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