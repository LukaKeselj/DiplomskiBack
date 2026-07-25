import * as supplementLogService from "../services/supplementLogService.js";
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
        const {supplement, date} = req.query;
        const logs = await supplementLogService.getAllLogs(req.userId, {supplement, date});
        res.status(200).json(logs);
    }catch(error){
        handleError(res, error, "getAllLogs");
    }
}

export async function logSupplementTaken(req,res){
    try{
        const {supplement, date, taken} = req.body;
        const log = await supplementLogService.logSupplementTaken(req.userId, {supplement, date, taken});
        res.status(200).json(log);
    }catch(error){
        handleError(res, error, "logSupplementTaken");
    }
}

export async function deleteLog(req,res){
    try{
        await supplementLogService.deleteLog(req.params.id, req.userId, req.userRole);
        res.status(200).json({message:"Zapis uspešno obrisan"});
    }catch(error){
        handleError(res, error, "deleteLog");
    }
}
