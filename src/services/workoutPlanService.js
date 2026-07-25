import mongoose from "mongoose";
import * as workoutPlanRepository from "../repositories/workoutPlanRepository.js";
import * as exerciseRepository from "../repositories/exerciseRepository.js";
import { AppError } from "../errors/AppError.js";

function assertValidExerciseId(id){
    if(!mongoose.Types.ObjectId.isValid(id)){
        throw new AppError("Nevažeći ID vežbe", 400);
    }
}

function assertValidId(id){
    if(!mongoose.Types.ObjectId.isValid(id)){
        throw new AppError("Nevažeći ID plana", 400);
    }
}

function assertOwnerOrAdmin(plan, requesterId, requesterRole){
    if(requesterRole === "admin") return;
    if(plan.user.toString() !== requesterId){
        throw new AppError("Nemate pristup ovom planu", 403);
    }
}

function validateDays(days){
    if(!Array.isArray(days)) return [];

    return days.map((day) => {
        if(!day.dayName){
            throw new AppError("Naziv dana je obavezan", 400);
        }

        const exercises = Array.isArray(day.exercises) ? day.exercises : [];

        exercises.forEach((entry) => {
            if(!entry.exercise){
                throw new AppError("Vežba je obavezna za svaku stavku dana", 400);
            }
            assertValidExerciseId(entry.exercise);
        });

        return {
            dayName: day.dayName,
            exercises: exercises.map((entry) => ({
                exercise: entry.exercise,
                targetSets: entry.targetSets,
                targetReps: entry.targetReps,
                restMinutes: entry.restMinutes,
            })),
        };
    });
}

async function assertReferencedExercisesExist(days){
    const exerciseIds = [...new Set(
        days.flatMap((day) => day.exercises.map((entry) => entry.exercise.toString()))
    )];

    if(exerciseIds.length === 0) return;

    const count = await exerciseRepository.countByIds(exerciseIds);
    if(count !== exerciseIds.length){
        throw new AppError("Jedna ili više navedenih vežbi ne postoji", 400);
    }
}

export async function getAllWorkoutPlans(userId){
    return workoutPlanRepository.findAllByUser(userId);
}

export async function getWorkoutPlanById(id, requesterId, requesterRole){
    assertValidId(id);

    const plan = await workoutPlanRepository.findById(id);
    if(!plan) throw new AppError("Plan nije pronađen", 404);

    assertOwnerOrAdmin(plan, requesterId, requesterRole);

    return plan;
}

export async function createWorkoutPlan(userId, {name, days}){
    if(!name){
        throw new AppError("Naziv plana je obavezan", 400);
    }

    const validatedDays = validateDays(days);
    await assertReferencedExercisesExist(validatedDays);

    return workoutPlanRepository.create({
        user: userId,
        name,
        days: validatedDays,
    });
}

export async function updateWorkoutPlan(id, requesterId, requesterRole, {name, days}){
    assertValidId(id);

    const plan = await workoutPlanRepository.findById(id);
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
        const validatedDays = validateDays(days);
        await assertReferencedExercisesExist(validatedDays);
        updateData.days = validatedDays;
    }

    const updatedPlan = await workoutPlanRepository.updateById(id, updateData);
    if(!updatedPlan) throw new AppError("Plan nije pronađen", 404);

    return updatedPlan;
}

export async function deleteWorkoutPlan(id, requesterId, requesterRole){
    assertValidId(id);

    const plan = await workoutPlanRepository.findById(id);
    if(!plan) throw new AppError("Plan nije pronađen", 404);

    assertOwnerOrAdmin(plan, requesterId, requesterRole);

    await workoutPlanRepository.deleteById(id);
}
