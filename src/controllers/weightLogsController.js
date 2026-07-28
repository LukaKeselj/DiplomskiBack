import { AppError } from "../errors/AppError.js";

function handleError(res, error, context){
    if(error instanceof AppError){
        return res.status(error.statusCode).json({message: error.message});
    }
    console.error(`Error in ${context} controller`, error);
    res.status(500).json({message:"Internal server error"});
}

export function createWeightLogsController({ weightLogService }){
    async function getAllLogs(req,res){
        try{
            const {date} = req.query;
            const logs = await weightLogService.getAllLogs(req.userId, {date});
            res.status(200).json(logs);
        }catch(error){
            handleError(res, error, "getAllLogs");
        }
    }

    async function getWeeklyStatus(req,res){
        try{
            const status = await weightLogService.getWeeklyStatus(req.userId);
            res.status(200).json(status);
        }catch(error){
            handleError(res, error, "getWeeklyStatus");
        }
    }

    async function logWeight(req,res){
        try{
            const {date, weight} = req.body;
            const log = await weightLogService.logWeight(req.userId, {date, weight});
            res.status(200).json(log);
        }catch(error){
            handleError(res, error, "logWeight");
        }
    }

    async function deleteLog(req,res){
        try{
            await weightLogService.deleteLog(req.params.id, req.userId, req.userRole);
            res.status(200).json({message:"Zapis uspešno obrisan"});
        }catch(error){
            handleError(res, error, "deleteLog");
        }
    }

    return { getAllLogs, getWeeklyStatus, logWeight, deleteLog };
}
