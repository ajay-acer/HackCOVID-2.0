const express=require('express')
      app=express()
      bodyparser=require('body-parser')
      require('dotenv').config()

app.set("view engine","ejs")
app.use(express.static("public"))
app.use(bodyparser.urlencoded({extended: true}))

app.get("/",(req,res)=>{
    res.render("login")
})

app.listen(process.env.PORT||3000,()=>{
    console.log("Server started at port 3000")
})