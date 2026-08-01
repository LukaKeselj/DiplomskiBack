import { AppError } from "../errors/AppError.js";

function handleError(res, error, context){
    if(error instanceof AppError){
        return res.status(error.statusCode).json({message: error.message});
    }
    console.error(`Error in ${context} controller`, error);
    res.status(500).json({message:"Internal server error"});
}

export function createFitnessScoreController({ fitnessScoreService }){
    async function getScoreHistory(req,res){
        try{
            const {weeks} = req.query;
            const history = await fitnessScoreService.getScoreHistory(req.userId, {weeks});
            res.status(200).json(history);
        }catch(error){
            handleError(res, error, "getScoreHistory");
        }
    }

    return { getScoreHistory };
}
