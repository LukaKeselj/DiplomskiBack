import mongoose from "mongoose";
import User from "../models/User.js";

export async function getAllUsers(req,res){
    try{
        const users= await User.find().select("-password").sort({createdAt:-1});
        res.status(200).json(users);
    }catch(error){
        console.error("Error in getAllUsers controller",error);
        res.status(500).json({message:"Internal server error"});

    }

}

export async function createUser(req,res){
    try{
        const {name,surname,username,email,password,height}=req.body;
        const user= new User({name,surname,username,email,password,height});


        const newUser=await user.save();
        const userToReturn = newUser.toObject();
        delete userToReturn.password;
        res.status(201).json(userToReturn);
    }catch(error){
        console.error("Error in createUser controller",error);
        res.status(500).json({message:"Internal server error"});

    }
}

export async function deleteUser(req,res){
    try{
        if(!mongoose.Types.ObjectId.isValid(req.params.id)){
            return res.status(400).json({message:"Invalid user id"});
        }

        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if(!deletedUser) return res.status(404).json({message:"User not found!"});

        res.status(200).json({message:"User deleted successfully"})
    }catch(error){
        console.error("Error in deleteUser controller",error);
        res.status(500).json({message:"Internal server error"});
    }
}
export async function updateUser(req,res){
    try{
        if(!mongoose.Types.ObjectId.isValid(req.params.id)){
            return res.status(400).json({message:"Invalid user id"});
        }

        const {name,surname,username,email,password,height}=req.body;

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            {name,surname,username,email,password,height},
            {new:true}
        ).select("-password");

        if(!updatedUser) return res.status(404).json({message:"User not found!"});

        res.status(200).json(updatedUser);
    }catch(error){
        console.error("Error in updateUser controller",error);
        res.status(500).json({message:"Internal server error"});

    }
}
export async function getUser(req,res){
    try{
        if(!mongoose.Types.ObjectId.isValid(req.params.id)){
            return res.status(400).json({message:"Invalid user id"});
        }

        const foundUser=await User.findById(req.params.id).select("-password");
        if(!foundUser) return res.status(404).json({message:"User not found!"});
        res.json(foundUser);
    }catch(error){
        console.error("Error in getUser controller",error);
        res.status(500).json({message:"Internal server error"});

    }
}
