import mongoose from "mongoose";
import { AppError } from "../errors/AppError.js";

function assertValidId(id){
    if(!mongoose.Types.ObjectId.isValid(id)){
        throw new AppError("Nevažeći ID suplementa", 400);
    }
}

export function createSupplementService({ supplementRepository }){
    async function getAllSupplements(){
        return supplementRepository.findAll();
    }

    async function getSupplementById(id){
        assertValidId(id);

        const supplement = await supplementRepository.findById(id);
        if(!supplement) throw new AppError("Suplement nije pronađen", 404);

        return supplement;
    }

    async function createSupplement({name, imageUrl, description}){
        if(!name){
            throw new AppError("Naziv suplementa je obavezan", 400);
        }

        try{
            return await supplementRepository.create({name, imageUrl, description});
        }catch(error){
            if(error.code === 11000){
                throw new AppError("Suplement sa ovim nazivom već postoji", 409);
            }
            throw error;
        }
    }

    async function updateSupplement(id, {name, imageUrl, description}){
        assertValidId(id);

        if(name !== undefined && !name){
            throw new AppError("Naziv suplementa je obavezan", 400);
        }

        const updateData = {};
        if(name !== undefined) updateData.name = name;
        if(imageUrl !== undefined) updateData.imageUrl = imageUrl;
        if(description !== undefined) updateData.description = description;

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

    async function deleteSupplement(id){
        assertValidId(id);

        const deletedSupplement = await supplementRepository.deleteById(id);
        if(!deletedSupplement) throw new AppError("Suplement nije pronađen", 404);
    }

    return { getAllSupplements, getSupplementById, createSupplement, updateSupplement, deleteSupplement };
}
