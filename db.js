const mongoose=require("mongoose");
const connectDB=async()=>{
try{
        const conn=await mongoose.connect("mongodb+srv://mr_ayan:1234tonystark@projectcluster.t3vfk.mongodb.net/SweatShare",{
            useNewUrlParser: true,
          
    });
    console.log("MongoDB connected:"+conn.connection.host)
    }
    catch(error){
        console.log(error)
    }
}
module.exports=connectDB;
