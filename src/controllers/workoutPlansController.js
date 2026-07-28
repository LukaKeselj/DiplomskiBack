import { AppError } from "../errors/AppError.js";

function handleError(res, error, context){
    if(error instanceof AppError){
        return res.status(error.statusCode).json({message: error.message});
    }
    console.error(`Error in ${context} controller`, error);
    res.status(500).json({message:"Internal server error"});
}

export function createWorkoutPlansController({ workoutPlanService }){
    async function getAllWorkoutPlans(req,res){
        try{
            const plans = await workoutPlanService.getAllWorkoutPlans(req.userId);
            res.status(200).json(plans);
        }catch(error){
            handleError(res, error, "getAllWorkoutPlans");
        }
    }

    async function getWorkoutPlan(req,res){
        try{
            const plan = await workoutPlanService.getWorkoutPlanById(req.params.id, req.userId, req.userRole);
            res.status(200).json(plan);
        }catch(error){
            handleError(res, error, "getWorkoutPlan");
        }
    }

    async function createWorkoutPlan(req,res){
        try{
            const {name, days} = req.body;
            const newPlan = await workoutPlanService.createWorkoutPlan(req.userId, {name, days});
            res.status(201).json(newPlan);
        }catch(error){
            handleError(res, error, "createWorkoutPlan");
        }
    }

    async function updateWorkoutPlan(req,res){
        try{
            const {name, days} = req.body;
            const updatedPlan = await workoutPlanService.updateWorkoutPlan(
                req.params.id,
                req.userId,
                req.userRole,
                {name, days}
            );
            res.status(200).json(updatedPlan);
        }catch(error){
            handleError(res, error, "updateWorkoutPlan");
        }
    }

    async function deleteWorkoutPlan(req,res){
        try{
            await workoutPlanService.deleteWorkoutPlan(req.params.id, req.userId, req.userRole);
            res.status(200).json({message:"Plan uspešno obrisan"});
        }catch(error){
            handleError(res, error, "deleteWorkoutPlan");
        }
    }

    async function activateWorkoutPlan(req,res){
        try{
            const updatedUser = await workoutPlanService.activatePlan(req.params.id, req.userId, req.userRole);
            res.status(200).json(updatedUser);
        }catch(error){
            handleError(res, error, "activateWorkoutPlan");
        }
    }

    async function getActiveWorkoutPlan(req,res){
        try{
            const plan = await workoutPlanService.getActivePlan(req.userId);
            res.status(200).json(plan);
        }catch(error){
            handleError(res, error, "getActiveWorkoutPlan");
        }
    }

    return {
        getAllWorkoutPlans,
        getWorkoutPlan,
        createWorkoutPlan,
        updateWorkoutPlan,
        deleteWorkoutPlan,
        activateWorkoutPlan,
        getActiveWorkoutPlan,
    };
}
