import WorkoutSession from "../models/WorkoutSession.js";

export function createWorkoutSessionRepository(){
    function findAllByUserAndPlan(userId, workoutPlanId){
        return WorkoutSession.find({user: userId, workoutPlan: workoutPlanId}).sort({createdAt: -1});
    }

    function findByUserAndDateRange(userId, startDate, endDate){
        return WorkoutSession.find({user: userId, date: {$gte: startDate, $lte: endDate}});
    }

    function findById(id){
        return WorkoutSession.findById(id);
    }

    function upsertSession({user, workoutPlan, day, date, status = "completed"}){
        return WorkoutSession.findOneAndUpdate(
            {user, day, date},
            {$set: {workoutPlan, status}},
            {new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true}
        );
    }

    function deleteById(id){
        return WorkoutSession.findByIdAndDelete(id);
    }

    return { findAllByUserAndPlan, findByUserAndDateRange, findById, upsertSession, deleteById };
}
