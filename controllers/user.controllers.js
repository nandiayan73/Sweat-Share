const User=require("../models/user.model");
const Post=require("../models/post.model");
const generateToken=require("../config/generateToken");
const registerUser=async(req,res)=>{


    const {name,email,password,dp}=req.body;

    // checking the response is correct or not
    if(!name|| !email || !password){
        res.status(400);
        throw new Error("Please enter all the fields");
    }
    const userExists=await User.findOne({email});
    if(userExists){
        res.status(400);
        throw new Error("User already exists");
    }
    console.log(dp)
    const user =await User.create({
        name:name,
        email,
        password,
        dp
    })
    if(user){
        console.log("User created!");
        res.status(201).json({
            _id:user._id,
            name:user.name,
            email:user.email,
            pic:user.pic,
        })
    }
    else{
        res.status(400);
        throw new Error("failed to create user!");
    }
}
const authUser=async(req,res)=>{

    const {email,password}=req.body;
    const user=await User.findOne({email});
    
    if(user && await user.matchPassword(password)){
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
    console.log("this is from update character!")
    const {email,password,cover_photo,dp,name,postPic}=req.body.data;
    
    console.log("ehhehe"+postPic.pic)
    if(postPic.pic){
        console.log(postPic);
        console.log(" Creating a new post");
      
        const new_post={
            pic:postPic.pic,
        }
        const updated_char=await User.findOneAndUpdate({email:email},{cover_photo:cover_photo,dp:dp,name:name,password:password,$push: {posts:new_post}});
    }
    const updated_char=await User.findOneAndUpdate({email:email},{cover_photo:cover_photo,dp:dp,name:name,password:password});
    res.status(201);
    res.send(updated_char);
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

module.exports={registerUser,authUser,addPosts,addComment,follow,unFollow,allUsers,addReplies};