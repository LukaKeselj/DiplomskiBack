import Supplement from "../models/Supplement.js";

export function findAll(){
    return Supplement.find().sort({name: 1});
}

export function findById(id){
    return Supplement.findById(id);
}

export function create(data){
    const supplement = new Supplement(data);
    return supplement.save();
}

export function updateById(id, data){
    return Supplement.findByIdAndUpdate(id, data, {new: true, runValidators: true});
}

export function deleteById(id){
    return Supplement.findByIdAndDelete(id);
}
