import mongoose from "mongoose";
import NutritionLog from "../models/NutritionLog.js";

export function findAllByUser(userId, filter = {}){
    return NutritionLog.find({user: userId, ...filter}).sort({date: -1, createdAt: -1});
}

export function findById(id){
    return NutritionLog.findById(id);
}

export function create(data){
    const log = new NutritionLog(data);
    return log.save();
}

export function updateById(id, data){
    return NutritionLog.findByIdAndUpdate(id, data, {new: true, runValidators: true});
}

export function deleteById(id){
    return NutritionLog.findByIdAndDelete(id);
}

export async function sumByUserAndDate(userId, date){
    const result = await NutritionLog.aggregate([
        {$match: {user: new mongoose.Types.ObjectId(userId), date}},
        {$group: {
            _id: null,
            calories: {$sum: "$calories"},
            protein: {$sum: "$protein"},
            fat: {$sum: "$fat"},
            carbs: {$sum: "$carbs"},
            fiber: {$sum: "$fiber"},
        }},
    ]);

    if(result.length === 0){
        return {calories: 0, protein: 0, fat: 0, carbs: 0, fiber: 0};
    }

    const {_id, ...totals} = result[0];
    return totals;
}
