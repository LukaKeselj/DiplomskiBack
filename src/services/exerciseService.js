import mongoose from "mongoose";
import * as exerciseRepository from "../repositories/exerciseRepository.js";
import { MUSCLE_GROUPS } from "../models/Exercise.js";
import { AppError } from "../errors/AppError.js";

const ALLOWED_FIELDS = ["name", "muscleGroup", "equipment", "description", "videoUrl"];

function pickAllowedFields(data){
    const result = {};
    for(const field of ALLOWED_FIELDS){
        if(data[field] !== undefined) result[field] = data[field];
    }
    return result;
}

function assertValidId(id){
    if(!mongoose.Types.ObjectId.isValid(id)){
        throw new AppError("Invalid exercise id", 400);
    }
}

function assertValidMuscleGroup(muscleGroup){
    if(muscleGroup !== undefined && !MUSCLE_GROUPS.includes(muscleGroup)){
        throw new AppError(`Mišićna grupa mora biti jedna od: ${MUSCLE_GROUPS.join(", ")}`, 400);
    }
}

export async function getAllExercises(){
    return exerciseRepository.findAll();
}

export async function getExerciseById(id){
    assertValidId(id);

    const exercise = await exerciseRepository.findById(id);
    if(!exercise) throw new AppError("Exercise not found!", 404);

    return exercise;
}

export async function createExercise(data){
    const payload = pickAllowedFields(data);

    if(!payload.name){
        throw new AppError("Naziv vežbe je obavezan", 400);
    }
    if(!payload.muscleGroup){
        throw new AppError("Mišićna grupa je obavezna", 400);
    }
    assertValidMuscleGroup(payload.muscleGroup);

    return exerciseRepository.create(payload);
}

export async function updateExercise(id, data){
    assertValidId(id);

    const payload = pickAllowedFields(data);

    if("name" in payload && !payload.name){
        throw new AppError("Naziv vežbe je obavezan", 400);
    }
    if("muscleGroup" in payload && !payload.muscleGroup){
        throw new AppError("Mišićna grupa je obavezna", 400);
    }
    assertValidMuscleGroup(payload.muscleGroup);

    const updatedExercise = await exerciseRepository.updateById(id, payload);
    if(!updatedExercise) throw new AppError("Exercise not found!", 404);

    return updatedExercise;
}

export async function deleteExercise(id){
    assertValidId(id);

    const deletedExercise = await exerciseRepository.deleteById(id);
    if(!deletedExercise) throw new AppError("Exercise not found!", 404);
}
