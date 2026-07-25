import mongoose from "mongoose";
import * as supplementRepository from "../repositories/supplementRepository.js";
import { AppError } from "../errors/AppError.js";

function assertValidId(id){
    if(!mongoose.Types.ObjectId.isValid(id)){
        throw new AppError("Nevažeći ID suplementa", 400);
    }
}

export async function getAllSupplements(){
    return supplementRepository.findAll();
}

export async function getSupplementById(id){
    assertValidId(id);

    const supplement = await supplementRepository.findById(id);
    if(!supplement) throw new AppError("Suplement nije pronađen", 404);

    return supplement;
}

export async function createSupplement({name, imageUrl}){
    if(!name){
        throw new AppError("Naziv suplementa je obavezan", 400);
    }

    try{
        return await supplementRepository.create({name, imageUrl});
    }catch(error){
        if(error.code === 11000){
            throw new AppError("Suplement sa ovim nazivom već postoji", 409);
        }
        throw error;
    }
}

export async function updateSupplement(id, {name, imageUrl}){
    assertValidId(id);

    if(name !== undefined && !name){
        throw new AppError("Naziv suplementa je obavezan", 400);
    }

    const updateData = {};
    if(name !== undefined) updateData.name = name;
    if(imageUrl !== undefined) updateData.imageUrl = imageUrl;

    try{
        const updatedSupplement = await supplementRepository.updateById(id, updateData);
        if(!updatedSupplement) throw new AppError("Suplement nije pronađen", 404);
        return updatedSupplement;
    }catch(error){
        if(error instanceof AppError) throw error;
        if(error.code === 11000){
            throw new AppError("Suplement sa ovim nazivom već postoji", 409);
        }
        throw error;
    }
}

export async function deleteSupplement(id){
    assertValidId(id);

    const deletedSupplement = await supplementRepository.deleteById(id);
    if(!deletedSupplement) throw new AppError("Suplement nije pronađen", 404);
}
