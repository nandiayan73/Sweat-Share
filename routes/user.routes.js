const express=require("express");
const bodyParser = require("body-parser");
const router=express.Router()
const {registerUser,authUser, addPosts, addComment, follow, unFollow, allUsers, addReplies}=require("../controllers/user.controllers")

router.use(bodyParser.urlencoded({extended: true}));

router.post("/register",registerUser)
router.post("/login",authUser)
router.post("/posts",addPosts)
router.post("/comments",addComment)
router.post("/follow",follow)
router.post("/unfollow",unFollow)
router.post("/allusers",allUsers)
router.post("/replies",addReplies)


module.exports=router; 