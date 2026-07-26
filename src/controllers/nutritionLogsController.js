import * as nutritionLogService from "../services/nutritionLogService.js";
import { AppError } from "../errors/AppError.js";

function handleError(res, error, context){
    if(error instanceof AppError){
        return res.status(error.statusCode).json({message: error.message});
    }
    console.error(`Error in ${context} controller`, error);
    res.status(500).json({message:"Internal server error"});
}

export async function getAllLogs(req,res){
    try{
        const {date} = req.query;
        const logs = await nutritionLogService.getAllLogs(req.userId, {date});
        res.status(200).json(logs);
    }catch(error){
        handleError(res, error, "getAllLogs");
    }
}

export async function getDailySummary(req,res){
    try{
        const {date} = req.query;
        const summary = await nutritionLogService.getDailySummary(req.userId, date);
        res.status(200).json(summary);
    }catch(error){
        handleError(res, error, "getDailySummary");
    }
}

export async function createLog(req,res){
    try{
        const {date, foodName, foodId, calories, protein, fat, carbs, fiber} = req.body;
        const newLog = await nutritionLogService.createLog(req.userId, {date, foodName, foodId, calories, protein, fat, carbs, fiber});
        res.status(201).json(newLog);
    }catch(error){
        handleError(res, error, "createLog");
    }
}

export async function updateLog(req,res){
    try{
        const {date, foodName, foodId, calories, protein, fat, carbs, fiber} = req.body;
        const updatedLog = await nutritionLogService.updateLog(
            req.params.id,
            req.userId,
            req.userRole,
            {date, foodName, foodId, calories, protein, fat, carbs, fiber}
        );
        res.status(200).json(updatedLog);
    }catch(error){
        handleError(res, error, "updateLog");
    }
}

export async function deleteLog(req,res){
    try{
        await nutritionLogService.deleteLog(req.params.id, req.userId, req.userRole);
        res.status(200).json({message:"Zapis uspešno obrisan"});
    }catch(error){
        handleError(res, error, "deleteLog");
    }
}
