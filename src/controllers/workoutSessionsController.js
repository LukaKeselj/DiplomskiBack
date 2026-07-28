import * as workoutSessionService from "../services/workoutSessionService.js";
import { AppError } from "../errors/AppError.js";

function handleError(res, error, context){
    if(error instanceof AppError){
        return res.status(error.statusCode).json({message: error.message});
    }
    console.error(`Error in ${context} controller`, error);
    res.status(500).json({message:"Internal server error"});
}

export async function getNextDay(req,res){
    try{
        const {workoutPlan} = req.query;
        const result = await workoutSessionService.getNextDay(req.userId, workoutPlan, req.userRole);
        res.status(200).json(result);
    }catch(error){
        handleError(res, error, "getNextDay");
    }
}

export async function getSessions(req,res){
    try{
        const {workoutPlan} = req.query;
        const sessions = await workoutSessionService.getSessions(req.userId, workoutPlan, req.userRole);
        res.status(200).json(sessions);
    }catch(error){
        handleError(res, error, "getSessions");
    }
}

export async function completeDay(req,res){
    try{
        const {workoutPlan, day, date} = req.body;
        const session = await workoutSessionService.completeDay(req.userId, req.userRole, {workoutPlan, day, date});
        res.status(200).json(session);
    }catch(error){
        handleError(res, error, "completeDay");
    }
}

export async function deleteSession(req,res){
    try{
        await workoutSessionService.deleteSession(req.params.id, req.userId, req.userRole);
        res.status(200).json({message:"Zapis uspešno obrisan"});
    }catch(error){
        handleError(res, error, "deleteSession");
    }
}
