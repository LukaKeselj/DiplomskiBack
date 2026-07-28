import Supplement from "../models/Supplement.js";

export function createSupplementRepository(){
    function findAll(){
        return Supplement.find().sort({name: 1});
    }

    function findById(id){
        return Supplement.findById(id);
    }

    function create(data){
        const supplement = new Supplement(data);
        return supplement.save();
    }

    function updateById(id, data){
        return Supplement.findByIdAndUpdate(id, data, {new: true, runValidators: true});
    }

    function deleteById(id){
        return Supplement.findByIdAndDelete(id);
    }

    return { findAll, findById, create, updateById, deleteById };
}
