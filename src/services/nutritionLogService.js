import mongoose from "mongoose";
import * as nutritionLogRepository from "../repositories/nutritionLogRepository.js";
import { AppError } from "../errors/AppError.js";

function assertValidId(id){
    if(!mongoose.Types.ObjectId.isValid(id)){
        throw new AppError("Nevažeći ID", 400);
    }
}

function assertOwnerOrAdmin(log, requesterId, requesterRole){
    if(requesterRole === "admin") return;
    if(log.user.toString() !== requesterId){
        throw new AppError("Nemate pristup ovom zapisu", 403);
    }
}

function normalizeDate(date){
    const parsed = date ? new Date(date) : new Date();
    if(Number.isNaN(parsed.getTime())){
        throw new AppError("Nevažeći datum", 400);
    }
    parsed.setUTCHours(0, 0, 0, 0);
    return parsed;
}

function assertMacros({calories, protein, fat, carbs}){
    if(calories === undefined || protein === undefined || fat === undefined || carbs === undefined){
        throw new AppError("Kalorije, proteini, masti i ugljeni hidrati su obavezni", 400);
    }
}

export async function getAllLogs(userId, {date} = {}){
    const filter = {};
    if(date !== undefined){
        filter.date = normalizeDate(date);
    }
    return nutritionLogRepository.findAllByUser(userId, filter);
}

export async function getDailySummary(userId, date){
    return nutritionLogRepository.sumByUserAndDate(userId, normalizeDate(date));
}

export async function createLog(userId, {date, foodName, foodId, calories, protein, fat, carbs, fiber}){
    if(!foodName){
        throw new AppError("Naziv namirnice je obavezan", 400);
    }
    assertMacros({calories, protein, fat, carbs});

    return nutritionLogRepository.create({
        user: userId,
        date: normalizeDate(date),
        foodName,
        foodId,
        calories,
        protein,
        fat,
        carbs,
        fiber: fiber ?? 0,
    });
}

export async function updateLog(id, requesterId, requesterRole, data){
    assertValidId(id);

    const log = await nutritionLogRepository.findById(id);
    if(!log) throw new AppError("Zapis nije pronađen", 404);

    assertOwnerOrAdmin(log, requesterId, requesterRole);

    const updateData = {};

    if(data.foodName !== undefined){
        if(!data.foodName) throw new AppError("Naziv namirnice je obavezan", 400);
        updateData.foodName = data.foodName;
    }
    if(data.date !== undefined) updateData.date = normalizeDate(data.date);
    if(data.foodId !== undefined) updateData.foodId = data.foodId;
    if(data.calories !== undefined) updateData.calories = data.calories;
    if(data.protein !== undefined) updateData.protein = data.protein;
    if(data.fat !== undefined) updateData.fat = data.fat;
    if(data.carbs !== undefined) updateData.carbs = data.carbs;
    if(data.fiber !== undefined) updateData.fiber = data.fiber;

    const updatedLog = await nutritionLogRepository.updateById(id, updateData);
    if(!updatedLog) throw new AppError("Zapis nije pronađen", 404);

    return updatedLog;
}

export async function deleteLog(id, requesterId, requesterRole){
    assertValidId(id);

    const log = await nutritionLogRepository.findById(id);
    if(!log) throw new AppError("Zapis nije pronađen", 404);

    assertOwnerOrAdmin(log, requesterId, requesterRole);

    await nutritionLogRepository.deleteById(id);
}
