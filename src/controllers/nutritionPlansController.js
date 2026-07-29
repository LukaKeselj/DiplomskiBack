import { AppError } from "../errors/AppError.js";

function handleError(res, error, context){
    if(error instanceof AppError){
        return res.status(error.statusCode).json({message: error.message});
    }
    console.error(`Error in ${context} controller`, error);
    res.status(500).json({message:"Internal server error"});
}

export function createNutritionPlansController({ nutritionPlanService }){
    async function getAllNutritionPlans(req,res){
        try{
            const plans = await nutritionPlanService.getAllNutritionPlans(req.userId);
            res.status(200).json(plans);
        }catch(error){
            handleError(res, error, "getAllNutritionPlans");
        }
    }

    async function getNutritionPlan(req,res){
        try{
            const plan = await nutritionPlanService.getNutritionPlanById(req.params.id, req.userId, req.userRole);
            res.status(200).json(plan);
        }catch(error){
            handleError(res, error, "getNutritionPlan");
        }
    }

    async function createNutritionPlan(req,res){
        try{
            const {name, days} = req.body;
            const newPlan = await nutritionPlanService.createNutritionPlan(req.userId, {name, days});
            res.status(201).json(newPlan);
        }catch(error){
            handleError(res, error, "createNutritionPlan");
        }
    }

    async function updateNutritionPlan(req,res){
        try{
            const {name, days} = req.body;
            const updatedPlan = await nutritionPlanService.updateNutritionPlan(
                req.params.id,
                req.userId,
                req.userRole,
                {name, days}
            );
            res.status(200).json(updatedPlan);
        }catch(error){
            handleError(res, error, "updateNutritionPlan");
        }
    }

    async function deleteNutritionPlan(req,res){
        try{
            await nutritionPlanService.deleteNutritionPlan(req.params.id, req.userId, req.userRole);
            res.status(200).json({message:"Plan uspešno obrisan"});
        }catch(error){
            handleError(res, error, "deleteNutritionPlan");
        }
    }

    async function activateNutritionPlan(req,res){
        try{
            const updatedUser = await nutritionPlanService.activatePlan(req.params.id, req.userId, req.userRole);
            res.status(200).json(updatedUser);
        }catch(error){
            handleError(res, error, "activateNutritionPlan");
        }
    }

    async function getActiveNutritionPlan(req,res){
        try{
            const plan = await nutritionPlanService.getActivePlan(req.userId);
            res.status(200).json(plan);
        }catch(error){
            handleError(res, error, "getActiveNutritionPlan");
        }
    }

    async function confirmItem(req,res){
        try{
            const {item, date} = req.body;
            const {log, created} = await nutritionPlanService.confirmItem(
                req.params.id,
                item,
                req.userId,
                req.userRole,
                date
            );
            res.status(created ? 201 : 200).json(log);
        }catch(error){
            handleError(res, error, "confirmItem");
        }
    }

    return {
        getAllNutritionPlans,
        getNutritionPlan,
        createNutritionPlan,
        updateNutritionPlan,
        deleteNutritionPlan,
        activateNutritionPlan,
        getActiveNutritionPlan,
        confirmItem,
    };
}
