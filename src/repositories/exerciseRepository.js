import Exercise from "../models/Exercise.js";

export function findAll(){
    return Exercise.find().sort({createdAt: -1});
}

export function findById(id){
    return Exercise.findById(id);
}

export function create(data){
    const exercise = new Exercise(data);
    return exercise.save();
}

export function updateById(id, data){
    return Exercise.findByIdAndUpdate(id, data, {new: true, runValidators: true});
}

export function deleteById(id){
    return Exercise.findByIdAndDelete(id);
}

export function countByIds(ids){
    return Exercise.countDocuments({_id: {$in: ids}});
}
