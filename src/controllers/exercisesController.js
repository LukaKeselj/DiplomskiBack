import { AppError } from "../errors/AppError.js";

function handleError(res, error, context){
    if(error instanceof AppError){
        return res.status(error.statusCode).json({message: error.message});
    }
    console.error(`Error in ${context} controller`, error);
    res.status(500).json({message:"Internal server error"});
}

export function createExercisesController({ exerciseService }){
    async function getAllExercises(req,res){
        try{
            const exercises = await exerciseService.getAllExercises();
            res.status(200).json(exercises);
        }catch(error){
            handleError(res, error, "getAllExercises");
        }
    }

    async function getExercise(req,res){
        try{
            const exercise = await exerciseService.getExerciseById(req.params.id);
            res.status(200).json(exercise);
        }catch(error){
            handleError(res, error, "getExercise");
        }
    }

    async function createExercise(req,res){
        try{
            const {name,muscleGroup,equipment,description,videoUrl} = req.body;
            const newExercise = await exerciseService.createExercise({name,muscleGroup,equipment,description,videoUrl});
            res.status(201).json(newExercise);
        }catch(error){
            handleError(res, error, "createExercise");
        }
    }

    async function updateExercise(req,res){
        try{
            const {name,muscleGroup,equipment,description,videoUrl} = req.body;
            const updatedExercise = await exerciseService.updateExercise(req.params.id, {name,muscleGroup,equipment,description,videoUrl});
            res.status(200).json(updatedExercise);
        }catch(error){
            handleError(res, error, "updateExercise");
        }
    }

    async function deleteExercise(req,res){
        try{
            await exerciseService.deleteExercise(req.params.id);
            res.status(200).json({message:"Exercise deleted successfully"});
        }catch(error){
            handleError(res, error, "deleteExercise");
        }
    }

    return { getAllExercises, getExercise, createExercise, updateExercise, deleteExercise };
}
