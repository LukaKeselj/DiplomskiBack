import mongoose from "mongoose";
import { AppError } from "../errors/AppError.js";

function assertValidId(id){
    if(!mongoose.Types.ObjectId.isValid(id)){
        throw new AppError("Nevažeći ID", 400);
    }
}

function assertOwnerOrAdmin(userSupplement, requesterId, requesterRole){
    if(requesterRole === "admin") return;
    if(userSupplement.user.toString() !== requesterId){
        throw new AppError("Nemate pristup ovom suplementu", 403);
    }
}

export function createUserSupplementService({ userSupplementRepository, supplementRepository }){
    async function assertSupplementExists(supplementId){
        if(!supplementId || !mongoose.Types.ObjectId.isValid(supplementId)){
            throw new AppError("Nevažeći ID suplementa", 400);
        }

        const supplement = await supplementRepository.findById(supplementId);
        if(!supplement){
            throw new AppError("Suplement ne postoji", 400);
        }
    }

    async function getAllUserSupplements(userId){
        return userSupplementRepository.findAllByUser(userId);
    }

    async function getUserSupplementById(id, requesterId, requesterRole){
        assertValidId(id);

        const userSupplement = await userSupplementRepository.findById(id);
        if(!userSupplement) throw new AppError("Suplement nije pronađen", 404);

        assertOwnerOrAdmin(userSupplement, requesterId, requesterRole);

        return userSupplement;
    }

    async function createUserSupplement(userId, {supplement, dosage, timeOfDay, active}){
        if(!dosage){
            throw new AppError("Doza je obavezna", 400);
        }
        if(!timeOfDay){
            throw new AppError("Vreme uzimanja je obavezno", 400);
        }
        await assertSupplementExists(supplement);

        return userSupplementRepository.create({
            user: userId,
            supplement,
            dosage,
            timeOfDay,
            active,
        });
    }

    async function updateUserSupplement(id, requesterId, requesterRole, {supplement, dosage, timeOfDay, active}){
        assertValidId(id);

        const userSupplement = await userSupplementRepository.findById(id);
        if(!userSupplement) throw new AppError("Suplement nije pronađen", 404);

        assertOwnerOrAdmin(userSupplement, requesterId, requesterRole);

        const updateData = {};

        if(supplement !== undefined){
            await assertSupplementExists(supplement);
            updateData.supplement = supplement;
        }
        if(dosage !== undefined){
            if(!dosage) throw new AppError("Doza je obavezna", 400);
            updateData.dosage = dosage;
        }
        if(timeOfDay !== undefined){
            if(!timeOfDay) throw new AppError("Vreme uzimanja je obavezno", 400);
            updateData.timeOfDay = timeOfDay;
        }
        if(active !== undefined){
            updateData.active = active;
        }

        const updatedUserSupplement = await userSupplementRepository.updateById(id, updateData);
        if(!updatedUserSupplement) throw new AppError("Suplement nije pronađen", 404);

        return updatedUserSupplement;
    }

    async function deleteUserSupplement(id, requesterId, requesterRole){
        assertValidId(id);

        const userSupplement = await userSupplementRepository.findById(id);
        if(!userSupplement) throw new AppError("Suplement nije pronađen", 404);

        assertOwnerOrAdmin(userSupplement, requesterId, requesterRole);

        await userSupplementRepository.deleteById(id);
    }

    return { getAllUserSupplements, getUserSupplementById, createUserSupplement, updateUserSupplement, deleteUserSupplement };
}
