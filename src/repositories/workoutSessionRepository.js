import WorkoutSession from "../models/WorkoutSession.js";

export function findAllByUserAndPlan(userId, workoutPlanId){
    return WorkoutSession.find({user: userId, workoutPlan: workoutPlanId}).sort({createdAt: -1});
}

export function findLastByUserAndPlan(userId, workoutPlanId){
    return WorkoutSession.findOne({user: userId, workoutPlan: workoutPlanId}).sort({createdAt: -1});
}

export function findById(id){
    return WorkoutSession.findById(id);
}

export function upsertSession({user, workoutPlan, day, date}){
    return WorkoutSession.findOneAndUpdate(
        {user, day, date},
        {$set: {workoutPlan}},
        {new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true}
    );
}

export function deleteById(id){
    return WorkoutSession.findByIdAndDelete(id);
}
