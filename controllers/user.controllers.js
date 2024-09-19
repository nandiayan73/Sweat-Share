const User=require("../models/user.model");
const Post=require("../models/post.model");
const nodemailer = require('nodemailer');
const generateToken=require("../config/generateToken");
const dotenv = require('dotenv');

dotenv.config(); 




// Configure Nodemailer Transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // Your Gmail address
        pass: process.env.EMAIL_PASS, // Your Gmail password or App Password
    },
    tls: {
        rejectUnauthorized: false // Bypass self-signed certificate issue
    }
});



//Registering the user:
const registerUser=async(req,res)=>{

    const {name,email,password,username}=req.body;
    console.log(req.body);
    // checking the response is correct or not
    if(!name|| !email || !password ){
        res.status(400);
        throw new Error("Please enter all the fields");
    }
    // Adding the picture
    // const now = new Date();
    // const day = now.getDate(); // Day of the month
    // const month = now.getMonth() + 1; // Month (1-12)
    // const year = now.getFullYear();
    // const hours = now.getHours(); // Hours (0-23)
    // const minutes = now.getMinutes(); // Minutes (0-59)
    // const seconds = now.getSeconds(); // Seconds (0-59)
    // const formattedDate = `${day}/${month}/${year}`;
    // const formattedTime = `${hours}:${minutes}:${seconds}`;

    
    
    photos="https://www.shutterstock.com/image-vector/vector-flat-illustration-grayscale-avatar-600nw-2264922221.jpg";
    const dpicture=await Post.create({
        photos,
    });
    // check the email
    const userExists=await User.findOne({email});
    if(userExists && userExists.isVerified){
        res.status(400);
        throw new Error("User already exists");
    }
    
    //Creating user:

    // sending the otp  
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // OTP expires in 5 minutes
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Please enter the otp in the webapp',
        text: `Your OTP code is ${otp}. It is valid for 5 minutes.`,
    };

    const sendmail= await transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
        console.log(error);
        return res.status(500).json({ message: 'Failed to send OTP email' });
        }
        res.status(200).json({ message: 'OTP sent to your email' });
    });

    // Registering the user:
    const user = await User.create({
        name,
        email,
        password,
        dp:dpicture._id,//has the post id which is a display picture
        otp,
        otpExpires
    })
    if(user){
        console.log("Otp sent!");
        res.status(201).json({
            _id:user._id,
            name:user.name,
            email:user.email,
            pic:user.pic,
        })
    }
    else
    {
        res.status(400);
        throw new Error("failed to create user!");
    }
}

const matchOtp=async(req,res)=>
{
  console.log("Matching otp");
  const { email, otp ,_id} = req.body;
  const user = await User.findOne({ email ,_id});

  console.log(req.body);
  if (!user) {
    return res.status(400).json({ message: 'User not found' });
  }
  try
  {
      if (user.otp === otp && user.otpExpires > Date.now()) 
        {
        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();
        // Sending the register message:
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your account has been successfully created on Sweat Share. ',
            text: `Sweat today Shine tommorow!`,
        };
    
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
            console.log(error);
            return res.status(500).json({ message: 'Failed to resgister user' });
            }
            res.status(200).json({ message: 'User registered successfully' });
        });
    
        // delete all the unregistered users with the registered email address.
        const delUnreg=await User.deleteMany({email,isVerified:false});
    
        // sending message to frontend
        res.status(201).json({ message: 'Account registered successfully' });
    
      } else {
        res.status(400).json({ message: 'Error registering the user' });
      }
  }
  catch(e)
  {
    console.log(e);
    res.status(400).json({ message: 'Error registering the user' });
  }
}


// User login:
const authUser=async(req,res)=>{

    const {email,password}=req.body;
    const user=await User.findOne({email});
    
    if(user && await user.matchPassword(password) && user.isVerified){
        const token=generateToken(user._id);
        
        const logged_user= await User.findOneAndUpdate({email:email},{token:token});
        
        res.cookie('HareKrishna', token, { maxAge: Date.now()+ 36000000 });
        
        if(req.cookies.HareKrishna)
            console.log("Cookies generated!");

        res.status(201).json({
            _id:user._id,
            name:user.name,
            email:user.email,
            pic:user.pic,
            token: generateToken(user._id),
        })
        res.status(201);
        res.send(updated_char)
    }
    else{
        res.status(400);
        throw new Error("Password didn't match!/Wrong credentials!");
    }
}
const updateUser=async(req,res)=>{
    const {email,password,dp,name}=req.body;
    try
    {
        const updated_char=await User.findOneAndUpdate({email:email},{dp,name,password});
        res.status(201);
        res.send(updated_char);
    }
    catch(e)
    {
        res.status(400);
        throw new Error(e);
    }
}


// SEARCHING ALL THE USERS:-
const allUsers=async(req,res)=>{
    const {allUsers}=req.body;
    const keyword=allUsers
    ?
    {
        $or:[
            {name:{$regex:allUsers,$options:"i"}},
            {email:{$regex:allUsers,$options:"i"}}
     ],
    }:{};

    const users=await User.find(keyword)
    if(users){
        console.log(users);
        res.status(201);
        res.send(users);
    }
    else{
        res.status(400);
        throw new Error("No users found!")        
    }

};


const addPosts=async(req,res)=>{
    const {userId,photos,caption}=req.body;
    try
    {
    const now = new Date();
    const day = now.getDate(); // Day of the month
    const month = now.getMonth() + 1; // Month (1-12)
    const year = now.getFullYear();
    const hours = now.getHours(); // Hours (0-23)
    const minutes = now.getMinutes(); // Minutes (0-59)
    const seconds = now.getSeconds(); // Seconds (0-59)
    const formattedDate = `${day}/${month}/${year}`;
    const formattedTime = `${hours}:${minutes}:${seconds}`;
        const post =await Post.create({
            photos,
            caption,
            date:formattedDate
        })
        if(post)
        {
            console.log("post created")
        }
        const user=await User.findByIdAndUpdate(userId, { $push: { posts: post._id } });
        if(user)
        {
            res.send("Post added");
            res.status(200);
        }
        else{
            res.send("Failed to add post");
            res.status(400);
            
        }

    }
    catch(e)
    {
        res.status(401);
        throw new error(e);
    }
}

const addComment=async(req,res)=>{
    const {postId,comment,userId}=req.body;
    try{
        const details={
            comment,
            userId,
        }
        const post =await Post.findOneAndUpdate({_id:postId},{ $push: {comments:details }});
        if(post)
        {
            const post =await Post.findOne({_id:postId});
            res.send("Success");
            res.status(200);
        }
    }
    catch(e)
    {
        res.status(400);
        throw new Error(e);

    }
}

const addReplies=async(req,res)=>{
    const {postId,userId,reply,commentId}=req.body;
    try {
        const msg={
            userId,
            message:reply
        }
        const updatedPost = await Post.findOneAndUpdate(
            { _id: postId, "comments._id": commentId },
            {
                $push: { "comments.$.replies": msg }
            },
            { new: true } 
        );
        console.log(updatedPost);
        res.send(updatedPost);
    }
    catch(error)
    {
        res.status(400);
        throw new Error(error);

    }

}


const follow=async(req,res)=>{
    const {userId,fId}=req.body;
    try
    {

        if(userId===fId)
        {
            res.status(400);
            throw new Error("Same account!");
        }

    // Check if the user already follows
    const isFollow=await User.findOne({_id:userId, following: { $in: [{id:fId}] }});
    if(isFollow)
    {
        res.status(400);
        throw new Error("User already follows!");
    }

    // increase followers and following
    const user =await User.findOneAndUpdate({_id:userId},{$push:{following:{id:fId}}, $inc: { followingCount: 1 }},{new:true});
    const followPerson = await User.findOneAndUpdate({_id:fId},{$push:{followers:{id:userId}}, $inc: { followersCount: 1 } },{new:true});
    if(user && followPerson)
    {
        res.status(200);
        res.send("Success");
    }

    }
    catch(error)
    {
        res.status(400);
        throw new Error(error);
    }
}


const unFollow=async (req,res)=>{
    const {userId,fId}=req.body;
    try{
        const user = await User.findOneAndUpdate(
            { _id: userId },
            { $pull: { following: {id:fId} }, $inc: { followingCount: -1 } },
            { new: true }
        );

        const follower=await User.findOneAndUpdate(
            {_id:fId},
            {$pull:{followers:{id:userId}},$inc:{followersCount:-1}},
            {new:true}
        )
        if(follower && user)
        {
            res.status(200);
            res.send("Succeess!");
        }
        else
        {
            res.status(400);
            res.send("Failed!");
        }
    }
    catch(error)
    {
        res.status(400);
        throw new Error(error);
    }
}

const deleteUser = async (req, res) => {
    const { email } = req.body;
    try {
      // Check if the user exists
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "User account not available!" });
      }
  
      // Delete the user
      const deleteResult = await User.deleteOne({ email });
  
      // Check if the deletion was successful
      if (deleteResult.deletedCount === 1) {
        res.status(200).json({ message: "User account deleted successfully." });
      } else {
        res.status(500).json({ message: "Failed to delete the user account." });
      }
    } catch (error) {
      // Handle unexpected errors
      res.status(500).json({ message: "An error occurred.", error: error.message });
    }
  };
  const updatePassword=(req,res)=>{
    const {newPassword,email}=req.body;
    try
    {
        const updatedUser = User.findOneAndUpdate({email},{password:newPassword});
        if(updatedUser)
        {
            res.status(201);
            res.send("Updated user with email: "+email);
        }
        else
        {
            res.status(400);
            throw new Error("Can't update user!");
        }
    }
    catch(e)
    {
        console.log(e);
        res.status(400);
        throw new Error(e);
    }
  }

  
module.exports={registerUser,authUser,addPosts,addComment,follow,unFollow,allUsers,addReplies,matchOtp,deleteUser,updateUser};