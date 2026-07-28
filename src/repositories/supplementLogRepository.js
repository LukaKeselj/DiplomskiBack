import SupplementLog from "../models/SupplementLog.js";

export function createSupplementLogRepository(){
    function findAllByUser(userId, filter = {}){
        return SupplementLog.find({user: userId, ...filter}).sort({date: -1});
    }

    function findById(id){
        return SupplementLog.findById(id);
    }

    function upsertLog({user, supplement, date, taken}){
        return SupplementLog.findOneAndUpdate(
            {user, supplement, date},
            {$set: {taken}},
            {new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true}
        );
    }

    function deleteById(id){
        return SupplementLog.findByIdAndDelete(id);
    }

    return { findAllByUser, findById, upsertLog, deleteById };
}
