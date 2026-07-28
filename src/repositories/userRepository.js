import User from "../models/User.js";

export function createUserRepository(){
    function findAll(excludeId){
        const filter = excludeId ? {_id: {$ne: excludeId}} : {};
        return User.find(filter).sort({createdAt:-1});
    }

    function findById(id){
        return User.findById(id);
    }

    function findByEmail(email){
        if(typeof email !== "string") return null;
        return User.findOne({email});
    }

    function create(data){
        const user = new User(data);
        return user.save();
    }

    function updateById(id, data){
        return User.findByIdAndUpdate(id, data, {new:true});
    }

    function deleteById(id){
        return User.findByIdAndDelete(id);
    }

    function setBlockedStatus(id, isBlocked){
        return User.findByIdAndUpdate(id, {isBlocked}, {new:true});
    }

    return { findAll, findById, findByEmail, create, updateById, deleteById, setBlockedStatus };
}
