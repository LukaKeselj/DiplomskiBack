import NutritionPlan from "../models/NutritionPlan.js";

export function createNutritionPlanRepository(){
    function findAllByUser(userId){
        return NutritionPlan.find({user: userId}).sort({createdAt: -1});
    }

    function create(data){
        const plan = new NutritionPlan(data);
        return plan.save();
    }

    function findById(id){
        return NutritionPlan.findById(id);
    }

    function updateById(id, data){
        return NutritionPlan.findByIdAndUpdate(id, data, {new: true, runValidators: true});
    }

    function deleteById(id){
        return NutritionPlan.findByIdAndDelete(id);
    }

    return { findAllByUser, create, findById, updateById, deleteById };
}
