import WeightLog from "../models/WeightLog.js";

export function findAllByUser(userId, filter = {}){
    return WeightLog.find({user: userId, ...filter}).sort({date: -1});
}

export function findById(id){
    return WeightLog.findById(id);
}

export function findLatestByUser(userId){
    return WeightLog.findOne({user: userId}).sort({date: -1});
}

export function upsertLog({user, date, weight}){
    return WeightLog.findOneAndUpdate(
        {user, date},
        {$set: {weight}},
        {new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true}
    );
}

export function deleteById(id){
    return WeightLog.findByIdAndDelete(id);
}
