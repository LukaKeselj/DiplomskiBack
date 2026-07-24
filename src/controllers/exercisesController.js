import * as exerciseService from "../services/exerciseService.js";
import { AppError } from "../errors/AppError.js";

function handleError(res, error, context){
    if(error instanceof AppError){
        return res.status(error.statusCode).json({message: error.message});
    }
    console.error(`Error in ${context} controller`, error);
    res.status(500).json({message:"Internal server error"});
}

export async function getAllExercises(req,res){
    try{
        const exercises = await exerciseService.getAllExercises();
        res.status(200).json(exercises);
    }catch(error){
        handleError(res, error, "getAllExercises");
    }
}

export async function getExercise(req,res){
    try{
        const exercise = await exerciseService.getExerciseById(req.params.id);
        res.status(200).json(exercise);
    }catch(error){
        handleError(res, error, "getExercise");
    }
}

export async function createExercise(req,res){
    try{
        const {name,muscleGroup,equipment,description,videoUrl} = req.body;
        const newExercise = await exerciseService.createExercise({name,muscleGroup,equipment,description,videoUrl});
        res.status(201).json(newExercise);
    }catch(error){
        handleError(res, error, "createExercise");
    }
}

export async function updateExercise(req,res){
    try{
        const {name,muscleGroup,equipment,description,videoUrl} = req.body;
        const updatedExercise = await exerciseService.updateExercise(req.params.id, {name,muscleGroup,equipment,description,videoUrl});
        res.status(200).json(updatedExercise);
    }catch(error){
        handleError(res, error, "updateExercise");
    }
}

export async function deleteExercise(req,res){
    try{
        await exerciseService.deleteExercise(req.params.id);
        res.status(200).json({message:"Exercise deleted successfully"});
    }catch(error){
        handleError(res, error, "deleteExercise");
    }
}
