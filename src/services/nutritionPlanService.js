import mongoose from "mongoose";
import { AppError } from "../errors/AppError.js";
import { normalizeDate, assertNotFutureDate } from "./nutritionLogService.js";

function toPublicUser(userDoc){
    const user = userDoc.toObject();
    delete user.password;
    return user;
}

function assertValidId(id){
    if(!mongoose.Types.ObjectId.isValid(id)){
        throw new AppError("Nevažeći ID plana", 400);
    }
}

function assertValidItemId(id){
    if(!mongoose.Types.ObjectId.isValid(id)){
        throw new AppError("Nevažeći ID stavke", 400);
    }
}

function assertOwnerOrAdmin(plan, requesterId, requesterRole){
    if(requesterRole === "admin") return;
    if(plan.user.toString() !== requesterId){
        throw new AppError("Nemate pristup ovom planu", 403);
    }
}

function assertMacros({calories, protein, fat, carbs}){
    if(calories === undefined || protein === undefined || fat === undefined || carbs === undefined){
        throw new AppError("Kalorije, proteini, masti i ugljeni hidrati su obavezni", 400);
    }
}

function validateItems(items){
    if(!Array.isArray(items)) return [];

    return items.map((item) => {
        if(!item.foodName){
            throw new AppError("Naziv namirnice je obavezan", 400);
        }
        assertMacros(item);

        return {
            foodName: item.foodName,
            foodId: item.foodId,
            calories: item.calories,
            protein: item.protein,
            fat: item.fat,
            carbs: item.carbs,
            fiber: item.fiber ?? 0,
        };
    });
}

function validateDays(days){
    if(!Array.isArray(days)) return [];

    return days.map((day) => {
        if(!day.dayName){
            throw new AppError("Naziv dana je obavezan", 400);
        }

        return {
            dayName: day.dayName,
            items: validateItems(day.items),
        };
    });
}

function findPlanItem(plan, itemId){
    for(const day of plan.days){
        const item = day.items.id(itemId);
        if(item) return item;
    }
    return null;
}

export function createNutritionPlanService({ nutritionPlanRepository, nutritionLogRepository, userRepository }){
    async function getAllNutritionPlans(userId){
        return nutritionPlanRepository.findAllByUser(userId);
    }

    async function getNutritionPlanById(id, requesterId, requesterRole){
        assertValidId(id);

        const plan = await nutritionPlanRepository.findById(id);
        if(!plan) throw new AppError("Plan nije pronađen", 404);

        assertOwnerOrAdmin(plan, requesterId, requesterRole);

        return plan;
    }

    async function createNutritionPlan(userId, {name, days}){
        if(!name){
            throw new AppError("Naziv plana je obavezan", 400);
        }

        const validatedDays = validateDays(days);

        return nutritionPlanRepository.create({
            user: userId,
            name,
            days: validatedDays,
        });
    }

    async function updateNutritionPlan(id, requesterId, requesterRole, {name, days}){
        assertValidId(id);

        const plan = await nutritionPlanRepository.findById(id);
        if(!plan) throw new AppError("Plan nije pronađen", 404);

        assertOwnerOrAdmin(plan, requesterId, requesterRole);

        const updateData = {};

        if(name !== undefined){
            if(!name){
                throw new AppError("Naziv plana je obavezan", 400);
            }
            updateData.name = name;
        }

        if(days !== undefined){
            updateData.days = validateDays(days);
        }

        const updatedPlan = await nutritionPlanRepository.updateById(id, updateData);
        if(!updatedPlan) throw new AppError("Plan nije pronađen", 404);

        return updatedPlan;
    }

    async function deleteNutritionPlan(id, requesterId, requesterRole){
        assertValidId(id);

        const plan = await nutritionPlanRepository.findById(id);
        if(!plan) throw new AppError("Plan nije pronađen", 404);

        assertOwnerOrAdmin(plan, requesterId, requesterRole);

        await nutritionPlanRepository.deleteById(id);
    }

    async function activatePlan(id, requesterId, requesterRole){
        assertValidId(id);

        const plan = await nutritionPlanRepository.findById(id);
        if(!plan) throw new AppError("Plan nije pronađen", 404);

        assertOwnerOrAdmin(plan, requesterId, requesterRole);

        const updatedUser = await userRepository.updateById(requesterId, {
            activeNutritionPlan: plan._id,
            activeNutritionPlanStartDate: normalizeDate(new Date()),
        });
        if(!updatedUser) throw new AppError("User not found!", 404);

        return toPublicUser(updatedUser);
    }

    async function getActivePlan(requesterId){
        const user = await userRepository.findById(requesterId);
        if(!user) throw new AppError("User not found!", 404);

        if(!user.activeNutritionPlan) return null;

        return nutritionPlanRepository.findById(user.activeNutritionPlan);
    }

    async function confirmItem(id, itemId, requesterId, requesterRole, date){
        assertValidId(id);
        assertValidItemId(itemId);

        const plan = await nutritionPlanRepository.findById(id);
        if(!plan) throw new AppError("Plan nije pronađen", 404);

        assertOwnerOrAdmin(plan, requesterId, requesterRole);

        const item = findPlanItem(plan, itemId);
        if(!item) throw new AppError("Stavka nije pronađena u planu", 404);

        const normalizedDate = normalizeDate(date);
        assertNotFutureDate(normalizedDate);

        const existingLog = await nutritionLogRepository.findOneByUserItemAndDate(requesterId, itemId, normalizedDate);
        if(existingLog){
            return {log: existingLog, created: false};
        }

        const newLog = await nutritionLogRepository.create({
            user: requesterId,
            date: normalizedDate,
            foodName: item.foodName,
            foodId: item.foodId,
            calories: item.calories,
            protein: item.protein,
            fat: item.fat,
            carbs: item.carbs,
            fiber: item.fiber,
            nutritionPlanItem: item._id,
        });

        return {log: newLog, created: true};
    }

    return {
        getAllNutritionPlans,
        getNutritionPlanById,
        createNutritionPlan,
        updateNutritionPlan,
        deleteNutritionPlan,
        activatePlan,
        getActivePlan,
        confirmItem,
    };
}
