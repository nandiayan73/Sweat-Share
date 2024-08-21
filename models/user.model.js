const mongoose=require("mongoose");
const bcrypt=require("bcrypt");
const Post=require("./post.model");
const userSchema=mongoose.Schema({
    name:{type:String,required:true},
    email:{type:String,required:true},
    password:{type:String,required:true},
    followersCount:{type:Number,default:0},
    followingCount:{type:Number,default:0},
    followers:[{id:{type:String}}],
    following:[{id:{type:String}}],
    dp:{type:String,default:"https://png.pngtree.com/png-vector/20191110/ourmid/pngtree-avatar-icon-profile-icon-member-login-vector-isolated-png-image_1978396.jpg"},
    cover_photo:{type:String,default:""},
    token:{type:String,default:""},
    gym:[{type:String}],
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: Post }],
},
{
    timestamps: true,
}
)
userSchema.pre("save",async function(next){
    if(!this.isModified){
        next();
    }
    const salt=await bcrypt.genSalt(10);
    this.password=await bcrypt.hash(this.password,salt);
})
userSchema.methods.matchPassword=async function(enteredPassword){
    return await bcrypt.compare(enteredPassword,this.password);
}
const User=mongoose.model("User",userSchema);
module.exports=User;