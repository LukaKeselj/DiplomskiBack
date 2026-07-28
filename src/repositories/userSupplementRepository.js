import UserSupplement from "../models/UserSupplement.js";

export function createUserSupplementRepository(){
    function findAllByUser(userId){
        return UserSupplement.find({user: userId}).sort({createdAt: -1});
    }

    function findById(id){
        return UserSupplement.findById(id);
    }

    function create(data){
        const userSupplement = new UserSupplement(data);
        return userSupplement.save();
    }

    function updateById(id, data){
        return UserSupplement.findByIdAndUpdate(id, data, {new: true, runValidators: true});
    }

    function deleteById(id){
        return UserSupplement.findByIdAndDelete(id);
    }

    return { findAllByUser, findById, create, updateById, deleteById };
}
