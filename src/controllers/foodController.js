import { AppError } from "../errors/AppError.js";

function handleError(res, error, context){
    if(error instanceof AppError){
        return res.status(error.statusCode).json({message: error.message});
    }
    console.error(`Error in ${context} controller`, error);
    res.status(500).json({message:"Internal server error"});
}

export function createFoodController({ fatsecretService }){
    async function searchFood(req,res){
        try{
            const {q} = req.query;
            const results = await fatsecretService.searchFoods(q);
            res.status(200).json(results);
        }catch(error){
            handleError(res, error, "searchFood");
        }
    }

    async function getFood(req,res){
        try{
            const details = await fatsecretService.getFoodDetails(req.params.id);
            res.status(200).json(details);
        }catch(error){
            handleError(res, error, "getFood");
        }
    }

    return { searchFood, getFood };
}
