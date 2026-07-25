import mongoose  from "mongoose";
import bcrypt from "bcryptjs";

const userSchema=new mongoose.Schema({
    name:{
        type: String,
        required: true,    
    },
    surname:{
        type: String,
        required: true,    
    },
    username:{
        type: String,
        required: true,
    },
    email:{
        type: String,
        required: true,
        unique: true,
    },
    password:{
        type: String,
        required: true,    
    },
    height:{
        type: Number,
        required: true,
    },
    weight:{
        type: Number,
    },
    profileImage:{
        type: String,
        default: "",
    },
    isVerified:{
        type: Boolean,
        default: false,
    },
    isBlocked:{
        type: Boolean,
        default: false,
    },
    role:{
        type: String,
        enum: ["user","admin"],
        default: "user",
    },
},
{timestamps:true}
);

userSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.pre("findOneAndUpdate", async function(next){
    const update = this.getUpdate();
    if(update.password){
        update.password = await bcrypt.hash(update.password, 10);
    }
    next();
});

const User = mongoose.model("User",userSchema)


export default User;