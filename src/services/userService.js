import mongoose from "mongoose";
import { AppError } from "../errors/AppError.js";
import { comparePassword } from "../utils/passwordUtils.js";
import { isValidEmail, isValidPassword } from "../utils/validators.js";

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

export function createUserService({ userRepository, auditLogService }){
    async function getAllUsers(excludeId){
        const users = await userRepository.findAll(excludeId);
        return users.map(toPublicUser);
    }

    async function getUserById(id){
        assertValidId(id);

        const user = await userRepository.findById(id);
        if(!user) throw new AppError("User not found!", 404);

        return toPublicUser(user);
    }

    async function updateUser(id, data, {requesterId, currentPassword} = {}){
        assertValidId(id);

        if(data.email !== undefined && !isValidEmail(data.email)){
            throw new AppError("Email adresa nije validna", 400);
        }

        if(data.password && requesterId === id){
            if(!isValidPassword(data.password)){
                throw new AppError("Šifra mora imati najmanje 8 karaktera", 400);
            }

            if(!currentPassword){
                throw new AppError("Trenutna šifra je obavezna", 400);
            }

            const existingUser = await userRepository.findById(id);
            if(!existingUser) throw new AppError("User not found!", 404);

            const passwordMatches = await comparePassword(currentPassword, existingUser.password);
            if(!passwordMatches){
                throw new AppError("Pogrešna trenutna šifra", 401);
            }
        }

        const updatedUser = await userRepository.updateById(id, data);
        if(!updatedUser) throw new AppError("User not found!", 404);

        return toPublicUser(updatedUser);
    }

    async function deleteUser(id, {actorId, ip} = {}){
        assertValidId(id);

        const deletedUser = await userRepository.deleteById(id);
        if(!deletedUser) throw new AppError("User not found!", 404);

        await auditLogService.log("USER_DELETED", {actorId, targetId: id, ip});
    }

    async function setUserBlockedStatus(id, isBlocked, {actorId, ip} = {}){
        assertValidId(id);

        const updatedUser = await userRepository.setBlockedStatus(id, isBlocked);
        if(!updatedUser) throw new AppError("User not found!", 404);

        await auditLogService.log(isBlocked ? "USER_BLOCKED" : "USER_UNBLOCKED", {actorId, targetId: id, ip});

        return toPublicUser(updatedUser);
    }

    return { getAllUsers, getUserById, updateUser, deleteUser, setUserBlockedStatus };
}
