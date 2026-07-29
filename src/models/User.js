import mongoose  from "mongoose";
import { hashPassword } from "../utils/passwordUtils.js";

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
    activeWorkoutPlan:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "WorkoutPlan",
        default: null,
    },
    activeNutritionPlan:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "NutritionPlan",
        default: null,
    },
    activeNutritionPlanStartDate:{
        type: Date,
        default: null,
    },
},
{timestamps:true}
);

userSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next();
    this.password = await hashPassword(this.password);
    next();
});

userSchema.pre("findOneAndUpdate", async function(next){
    const update = this.getUpdate();
    if(update.password){
        update.password = await hashPassword(update.password);
    }
    next();
});

const User = mongoose.model("User",userSchema)


export default User;