import WorkoutSession from "../models/WorkoutSession.js";

export function createWorkoutSessionRepository(){
    function findAllByUserAndPlan(userId, workoutPlanId){
        return WorkoutSession.find({user: userId, workoutPlan: workoutPlanId}).sort({createdAt: -1});
    }

    function findLastByUserAndPlan(userId, workoutPlanId){
        return WorkoutSession.findOne({user: userId, workoutPlan: workoutPlanId}).sort({createdAt: -1});
    }

    function findById(id){
        return WorkoutSession.findById(id);
    }

    function upsertSession({user, workoutPlan, day, date}){
        return WorkoutSession.findOneAndUpdate(
            {user, day, date},
            {$set: {workoutPlan}},
            {new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true}
        );
    }

    function deleteById(id){
        return WorkoutSession.findByIdAndDelete(id);
    }

    return { findAllByUserAndPlan, findLastByUserAndPlan, findById, upsertSession, deleteById };
}
