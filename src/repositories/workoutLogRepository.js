import WorkoutLog from "../models/WorkoutLog.js";

export function findAllByUser(userId, filter = {}){
    return WorkoutLog.find({user: userId, ...filter}).sort({date: -1});
}

export function findById(id){
    return WorkoutLog.findById(id);
}

export function upsertLog({user, exercise, date, weight}){
    return WorkoutLog.findOneAndUpdate(
        {user, exercise, date},
        {$set: {weight}},
        {new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true}
    );
}

export function deleteById(id){
    return WorkoutLog.findByIdAndDelete(id);
}
