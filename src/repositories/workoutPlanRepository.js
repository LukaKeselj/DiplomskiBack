import WorkoutPlan from "../models/WorkoutPlan.js";

export function createWorkoutPlanRepository(){
    function findAllByUser(userId){
        return WorkoutPlan.find({user: userId}).sort({createdAt: -1});
    }

    function create(data){
        const plan = new WorkoutPlan(data);
        return plan.save();
    }

    function findById(id){
        return WorkoutPlan.findById(id);
    }

    function updateById(id, data){
        return WorkoutPlan.findByIdAndUpdate(id, data, {new: true, runValidators: true});
    }

    function deleteById(id){
        return WorkoutPlan.findByIdAndDelete(id);
    }

    return { findAllByUser, create, findById, updateById, deleteById };
}
