import * as userSupplementService from "../services/userSupplementService.js";
import { AppError } from "../errors/AppError.js";

function handleError(res, error, context){
    if(error instanceof AppError){
        return res.status(error.statusCode).json({message: error.message});
    }
    console.error(`Error in ${context} controller`, error);
    res.status(500).json({message:"Internal server error"});
}

export async function getAllUserSupplements(req,res){
    try{
        const userSupplements = await userSupplementService.getAllUserSupplements(req.userId);
        res.status(200).json(userSupplements);
    }catch(error){
        handleError(res, error, "getAllUserSupplements");
    }
}

export async function getUserSupplement(req,res){
    try{
        const userSupplement = await userSupplementService.getUserSupplementById(req.params.id, req.userId, req.userRole);
        res.status(200).json(userSupplement);
    }catch(error){
        handleError(res, error, "getUserSupplement");
    }
}

export async function createUserSupplement(req,res){
    try{
        const {supplement, dosage, timeOfDay, active} = req.body;
        const newUserSupplement = await userSupplementService.createUserSupplement(req.userId, {supplement, dosage, timeOfDay, active});
        res.status(201).json(newUserSupplement);
    }catch(error){
        handleError(res, error, "createUserSupplement");
    }
}

export async function updateUserSupplement(req,res){
    try{
        const {supplement, dosage, timeOfDay, active} = req.body;
        const updatedUserSupplement = await userSupplementService.updateUserSupplement(
            req.params.id,
            req.userId,
            req.userRole,
            {supplement, dosage, timeOfDay, active}
        );
        res.status(200).json(updatedUserSupplement);
    }catch(error){
        handleError(res, error, "updateUserSupplement");
    }
}

export async function deleteUserSupplement(req,res){
    try{
        await userSupplementService.deleteUserSupplement(req.params.id, req.userId, req.userRole);
        res.status(200).json({message:"Suplement uspešno uklonjen"});
    }catch(error){
        handleError(res, error, "deleteUserSupplement");
    }
}
