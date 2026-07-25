import * as supplementService from "../services/supplementService.js";
import { AppError } from "../errors/AppError.js";

function handleError(res, error, context){
    if(error instanceof AppError){
        return res.status(error.statusCode).json({message: error.message});
    }
    console.error(`Error in ${context} controller`, error);
    res.status(500).json({message:"Internal server error"});
}

export async function getAllSupplements(req,res){
    try{
        const supplements = await supplementService.getAllSupplements();
        res.status(200).json(supplements);
    }catch(error){
        handleError(res, error, "getAllSupplements");
    }
}

export async function getSupplement(req,res){
    try{
        const supplement = await supplementService.getSupplementById(req.params.id);
        res.status(200).json(supplement);
    }catch(error){
        handleError(res, error, "getSupplement");
    }
}

export async function createSupplement(req,res){
    try{
        const {name, imageUrl} = req.body;
        const newSupplement = await supplementService.createSupplement({name, imageUrl});
        res.status(201).json(newSupplement);
    }catch(error){
        handleError(res, error, "createSupplement");
    }
}

export async function updateSupplement(req,res){
    try{
        const {name, imageUrl} = req.body;
        const updatedSupplement = await supplementService.updateSupplement(req.params.id, {name, imageUrl});
        res.status(200).json(updatedSupplement);
    }catch(error){
        handleError(res, error, "updateSupplement");
    }
}

export async function deleteSupplement(req,res){
    try{
        await supplementService.deleteSupplement(req.params.id);
        res.status(200).json({message:"Suplement uspešno obrisan"});
    }catch(error){
        handleError(res, error, "deleteSupplement");
    }
}
