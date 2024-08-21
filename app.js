const express=require("express");
const app=express();
const mongoose=require("mongoose");
const cors=require("cors");
const cookieParser = require('cookie-parser')
const bodyParser = require("body-parser");
const jwt=require("jsonwebtoken");
const db=require("./db");
const userRoutes=require("./routes/user.routes");
require('dotenv').config();


// Express routing:
app.use("/api/user",userRoutes)

// Setting the database:
db();

// using the parsers:
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));



app.post("/postman",(req,res)=>{
    const data=req.body;
    res.send(data);
})
app.get("/postman",(req,res)=>{
    res.send("this is the data received");
})

app.listen(process.env.PORT || 3000,(req,res)=>{
    console.log("Server is set at port number\t"+process.env.PORT);
})