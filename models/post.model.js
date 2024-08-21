const mongoose=require("mongoose");
const postSchema=mongoose.Schema({
    photos:[{type:String,required:"true"}],
    caption:{type:String},
    date:{type:String},
    likes:{type:Number,default:0},
    commentsNumber:{type:Number,default:0},
    comments:[{
        userId:{type:String},
        comment:{type:String,required:true},
        replies:[{userId:{type:String},message:{type:String},likes:{type:Number,default:0}}],
        likes:{type:Number,default:0},
    }],
    shared:{type:Number,default:0}

},{
timestamps:true,
}
)
const Post=mongoose.model("Post",postSchema);
module.exports=Post;