import User from "../models/User.js";

export function findAll(excludeId){
    const filter = excludeId ? {_id: {$ne: excludeId}} : {};
    return User.find(filter).sort({createdAt:-1});
}

export function findById(id){
    return User.findById(id);
}

export function findByEmail(email){
    return User.findOne({email});
}

export function create(data){
    const user = new User(data);
    return user.save();
}

export function updateById(id, data){
    return User.findByIdAndUpdate(id, data, {new:true});
}

export function deleteById(id){
    return User.findByIdAndDelete(id);
}
