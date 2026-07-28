import Exercise from "../models/Exercise.js";

export function createExerciseRepository(){
    function findAll(){
        return Exercise.find().sort({createdAt: -1});
    }

    function findById(id){
        return Exercise.findById(id);
    }

    function create(data){
        const exercise = new Exercise(data);
        return exercise.save();
    }

    function updateById(id, data){
        return Exercise.findByIdAndUpdate(id, data, {new: true, runValidators: true});
    }

    function deleteById(id){
        return Exercise.findByIdAndDelete(id);
    }

    function countByIds(ids){
        return Exercise.countDocuments({_id: {$in: ids}});
    }

    return { findAll, findById, create, updateById, deleteById, countByIds };
}
