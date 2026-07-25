import SupplementLog from "../models/SupplementLog.js";

export function findAllByUser(userId, filter = {}){
    return SupplementLog.find({user: userId, ...filter}).sort({date: -1});
}

export function findById(id){
    return SupplementLog.findById(id);
}

export function upsertLog({user, supplement, date, taken}){
    return SupplementLog.findOneAndUpdate(
        {user, supplement, date},
        {$set: {taken}},
        {new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true}
    );
}

export function deleteById(id){
    return SupplementLog.findByIdAndDelete(id);
}
