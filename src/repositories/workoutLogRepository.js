import WorkoutLog from "../models/WorkoutLog.js";

export function createWorkoutLogRepository(){
    function findAllByUser(userId, filter = {}){
        return WorkoutLog.find({user: userId, ...filter}).sort({date: -1});
    }

    function findById(id){
        return WorkoutLog.findById(id);
    }

    function upsertLog({user, exercise, date, weight}){
        return WorkoutLog.findOneAndUpdate(
            {user, exercise, date},
            {$set: {weight}},
            {new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true}
        );
    }

    function deleteById(id){
        return WorkoutLog.findByIdAndDelete(id);
    }

    return { findAllByUser, findById, upsertLog, deleteById };
}
