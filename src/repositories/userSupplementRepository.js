import UserSupplement from "../models/UserSupplement.js";

export function findAllByUser(userId){
    return UserSupplement.find({user: userId}).sort({createdAt: -1});
}

export function findById(id){
    return UserSupplement.findById(id);
}

export function create(data){
    const userSupplement = new UserSupplement(data);
    return userSupplement.save();
}

export function updateById(id, data){
    return UserSupplement.findByIdAndUpdate(id, data, {new: true, runValidators: true});
}

export function deleteById(id){
    return UserSupplement.findByIdAndDelete(id);
}
