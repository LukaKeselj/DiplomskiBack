import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import * as userRepository from "../repositories/userRepository.js";
import { AppError } from "../errors/AppError.js";

function toPublicUser(userDoc){
    const user = userDoc.toObject();
    delete user.password;
    return user;
}

function assertValidId(id){
    if(!mongoose.Types.ObjectId.isValid(id)){
        throw new AppError("Invalid user id", 400);
    }
}

export async function getAllUsers(excludeId){
    const users = await userRepository.findAll(excludeId);
    return users.map(toPublicUser);
}

export async function getUserById(id){
    assertValidId(id);

    const user = await userRepository.findById(id);
    if(!user) throw new AppError("User not found!", 404);

    return toPublicUser(user);
}

export async function updateUser(id, data, {requesterId, currentPassword} = {}){
    assertValidId(id);

    if(data.password && requesterId === id){
        if(!currentPassword){
            throw new AppError("Trenutna šifra je obavezna", 400);
        }

        const existingUser = await userRepository.findById(id);
        if(!existingUser) throw new AppError("User not found!", 404);

        const passwordMatches = await bcrypt.compare(currentPassword, existingUser.password);
        if(!passwordMatches){
            throw new AppError("Pogrešna trenutna šifra", 401);
        }
    }

    const updatedUser = await userRepository.updateById(id, data);
    if(!updatedUser) throw new AppError("User not found!", 404);

    return toPublicUser(updatedUser);
}

export async function deleteUser(id){
    assertValidId(id);

    const deletedUser = await userRepository.deleteById(id);
    if(!deletedUser) throw new AppError("User not found!", 404);
}

export async function setUserBlockedStatus(id, isBlocked){
    assertValidId(id);

    const updatedUser = await userRepository.setBlockedStatus(id, isBlocked);
    if(!updatedUser) throw new AppError("User not found!", 404);

    return toPublicUser(updatedUser);
}
