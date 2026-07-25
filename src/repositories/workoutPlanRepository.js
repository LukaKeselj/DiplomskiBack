import WorkoutPlan from "../models/WorkoutPlan.js";

export function findAllByUser(userId){
    return WorkoutPlan.find({user: userId}).sort({createdAt: -1});
}

export function create(data){
    const plan = new WorkoutPlan(data);
    return plan.save();
}

export function findById(id){
    return WorkoutPlan.findById(id);
}

export function updateById(id, data){
    return WorkoutPlan.findByIdAndUpdate(id, data, {new: true, runValidators: true});
}

export function deleteById(id){
    return WorkoutPlan.findByIdAndDelete(id);
}
