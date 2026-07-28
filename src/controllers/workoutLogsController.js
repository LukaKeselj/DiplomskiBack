import { AppError } from "../errors/AppError.js";

function handleError(res, error, context){
    if(error instanceof AppError){
        return res.status(error.statusCode).json({message: error.message});
    }
    console.error(`Error in ${context} controller`, error);
    res.status(500).json({message:"Internal server error"});
}

export function createWorkoutLogsController({ workoutLogService }){
    async function getAllLogs(req,res){
        try{
            const {exercise, date} = req.query;
            const logs = await workoutLogService.getAllLogs(req.userId, {exercise, date});
            res.status(200).json(logs);
        }catch(error){
            handleError(res, error, "getAllLogs");
        }
    }

    async function logWeight(req,res){
        try{
            const {exercise, date, weight} = req.body;
            const log = await workoutLogService.logWeight(req.userId, {exercise, date, weight});
            res.status(200).json(log);
        }catch(error){
            handleError(res, error, "logWeight");
        }
    }

    async function deleteLog(req,res){
        try{
            await workoutLogService.deleteLog(req.params.id, req.userId, req.userRole);
            res.status(200).json({message:"Zapis uspešno obrisan"});
        }catch(error){
            handleError(res, error, "deleteLog");
        }
    }

    return { getAllLogs, logWeight, deleteLog };
}
