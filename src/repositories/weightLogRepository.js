import WeightLog from "../models/WeightLog.js";

export function createWeightLogRepository(){
    function findAllByUser(userId, filter = {}){
        return WeightLog.find({user: userId, ...filter}).sort({date: -1});
    }

    function findById(id){
        return WeightLog.findById(id);
    }

    function findLatestByUser(userId){
        return WeightLog.findOne({user: userId}).sort({date: -1});
    }

    function upsertLog({user, date, weight}){
        return WeightLog.findOneAndUpdate(
            {user, date},
            {$set: {weight}},
            {new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true}
        );
    }

    function deleteById(id){
        return WeightLog.findByIdAndDelete(id);
    }

    return { findAllByUser, findById, findLatestByUser, upsertLog, deleteById };
}
