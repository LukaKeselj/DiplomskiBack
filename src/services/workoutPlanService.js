import mongoose from "mongoose";
import { AppError } from "../errors/AppError.js";

function toPublicUser(userDoc){
    const user = userDoc.toObject();
    delete user.password;
    return user;
}

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

export function createWorkoutPlanService({ workoutPlanRepository, exerciseRepository, userRepository }){
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

    async function getAllWorkoutPlans(userId){
        return workoutPlanRepository.findAllByUser(userId);
    }

    async function getWorkoutPlanById(id, requesterId, requesterRole){
        assertValidId(id);

        const plan = await workoutPlanRepository.findById(id);
        if(!plan) throw new AppError("Plan nije pronađen", 404);

        assertOwnerOrAdmin(plan, requesterId, requesterRole);

        return plan;
    }

    async function createWorkoutPlan(userId, {name, days}){
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

    async function updateWorkoutPlan(id, requesterId, requesterRole, {name, days}){
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

    async function deleteWorkoutPlan(id, requesterId, requesterRole){
        assertValidId(id);

        const plan = await workoutPlanRepository.findById(id);
        if(!plan) throw new AppError("Plan nije pronađen", 404);

        assertOwnerOrAdmin(plan, requesterId, requesterRole);

        await workoutPlanRepository.deleteById(id);
    }

    async function activatePlan(id, requesterId, requesterRole){
        assertValidId(id);

        const plan = await workoutPlanRepository.findById(id);
        if(!plan) throw new AppError("Plan nije pronađen", 404);

        assertOwnerOrAdmin(plan, requesterId, requesterRole);

        const updatedUser = await userRepository.updateById(requesterId, {activeWorkoutPlan: plan._id});
        if(!updatedUser) throw new AppError("User not found!", 404);

        return toPublicUser(updatedUser);
    }

    async function getActivePlan(requesterId){
        const user = await userRepository.findById(requesterId);
        if(!user) throw new AppError("User not found!", 404);

        if(!user.activeWorkoutPlan) return null;

        return workoutPlanRepository.findById(user.activeWorkoutPlan);
    }

    return {
        getAllWorkoutPlans,
        getWorkoutPlanById,
        createWorkoutPlan,
        updateWorkoutPlan,
        deleteWorkoutPlan,
        activatePlan,
        getActivePlan,
    };
}
