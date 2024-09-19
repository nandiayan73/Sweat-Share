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

// Setting the database:
db();






app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));

// for request from frontend
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
  }));

// app.use(bodyParser.urlencoded({extended: true}));


// Express routing:
app.use("/api/user",userRoutes)


// postman test:
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