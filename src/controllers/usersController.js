import * as userService from "../services/userService.js";
import { AppError } from "../errors/AppError.js";

function handleError(res, error, context){
    if(error instanceof AppError){
        return res.status(error.statusCode).json({message: error.message});
    }
    console.error(`Error in ${context} controller`, error);
    res.status(500).json({message:"Internal server error"});
}

export async function getAllUsers(req,res){
    try{
        const users = await userService.getAllUsers(req.userId);
        res.status(200).json(users);
    }catch(error){
        handleError(res, error, "getAllUsers");
    }
}

export async function deleteUser(req,res){
    try{
        await userService.deleteUser(req.params.id);
        res.status(200).json({message:"User deleted successfully"});
    }catch(error){
        handleError(res, error, "deleteUser");
    }
}

export async function updateUser(req,res){
    try{
        const {name,surname,username,email,password,currentPassword,height,weight,profileImage}=req.body;
        const updatedUser = await userService.updateUser(
            req.params.id,
            {name,surname,username,email,password,height,weight,profileImage},
            {requesterId: req.userId, currentPassword}
        );
        res.status(200).json(updatedUser);
    }catch(error){
        handleError(res, error, "updateUser");
    }
}

export async function getUser(req,res){
    try{
        const user = await userService.getUserById(req.params.id);
        res.json(user);
    }catch(error){
        handleError(res, error, "getUser");
    }
}

export async function setUserBlockedStatus(req,res){
    try{
        const {isBlocked} = req.body;
        const updatedUser = await userService.setUserBlockedStatus(req.params.id, isBlocked);
        res.status(200).json(updatedUser);
    }catch(error){
        handleError(res, error, "setUserBlockedStatus");
    }
}
