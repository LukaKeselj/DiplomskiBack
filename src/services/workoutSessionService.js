import mongoose from "mongoose";
import { AppError } from "../errors/AppError.js";

function assertValidId(id){
    if(!mongoose.Types.ObjectId.isValid(id)){
        throw new AppError("Nevažeći ID", 400);
    }
}

function assertOwnerOrAdmin(plan, requesterId, requesterRole){
    if(requesterRole === "admin") return;
    if(plan.user.toString() !== requesterId){
        throw new AppError("Nemate pristup ovom planu", 403);
    }
}

export function normalizeDate(date){
    const parsed = date ? new Date(date) : new Date();
    if(Number.isNaN(parsed.getTime())){
        throw new AppError("Nevažeći datum", 400);
    }
    parsed.setUTCHours(0, 0, 0, 0);
    return parsed;
}

function assertNotFutureDate(date){
    const today = normalizeDate();
    if(date > today){
        throw new AppError("Ne možeš označiti trening za dan koji još nije došao", 400);
    }
}

const WEEK_LENGTH = 7;

function buildTrainingSlotMap(trainingDaysCount){
    const slots = Array(WEEK_LENGTH).fill(null);
    for(let i = 0; i < trainingDaysCount; i++){
        const slot = Math.floor((i * WEEK_LENGTH) / trainingDaysCount);
        slots[slot] = i;
    }
    return slots;
}

export function getScheduledDay(plan, startDate, targetDate){
    if(plan.days.length === 0 || !startDate){
        return {day: null, index: null, isRestDay: null};
    }

    const diffDays = Math.round((targetDate - normalizeDate(startDate)) / (1000 * 60 * 60 * 24));
    const cycleIndex = ((diffDays % WEEK_LENGTH) + WEEK_LENGTH) % WEEK_LENGTH;

    const slots = buildTrainingSlotMap(plan.days.length);
    const trainingIndex = slots[cycleIndex];

    if(trainingIndex === null){
        return {day: null, index: null, isRestDay: true};
    }

    return {day: plan.days[trainingIndex], index: trainingIndex, isRestDay: false};
}

export function createWorkoutSessionService({ workoutSessionRepository, workoutPlanRepository, userRepository }){
    async function loadOwnedPlan(workoutPlanId, requesterId, requesterRole){
        assertValidId(workoutPlanId);

        const plan = await workoutPlanRepository.findById(workoutPlanId);
        if(!plan) throw new AppError("Plan nije pronađen", 404);

        assertOwnerOrAdmin(plan, requesterId, requesterRole);

        return plan;
    }

    async function loadActivePlanSchedule(userId, plan, date){
        const user = await userRepository.findById(userId);
        if(!user?.activeWorkoutPlan || user.activeWorkoutPlan.toString() !== plan._id.toString()){
            return {day: null, index: null, isRestDay: null};
        }

        return getScheduledDay(plan, user.activeWorkoutPlanStartDate, normalizeDate(date));
    }

    async function getNextDay(userId, workoutPlanId, requesterRole, date){
        const plan = await loadOwnedPlan(workoutPlanId, userId, requesterRole);
        return loadActivePlanSchedule(userId, plan, date);
    }

    async function getSessions(userId, workoutPlanId, requesterRole){
        const plan = await loadOwnedPlan(workoutPlanId, userId, requesterRole);
        return workoutSessionRepository.findAllByUserAndPlan(userId, plan._id);
    }

    async function completeDay(userId, requesterRole, {workoutPlan, day, date}){
        const plan = await loadOwnedPlan(workoutPlan, userId, requesterRole);

        if(!day || !mongoose.Types.ObjectId.isValid(day)){
            throw new AppError("Nevažeći ID dana", 400);
        }

        const normalizedDate = normalizeDate(date);
        assertNotFutureDate(normalizedDate);

        const scheduled = await loadActivePlanSchedule(userId, plan, normalizedDate);
        if(!scheduled.day || scheduled.day._id.toString() !== day){
            throw new AppError("Ovaj dan nije zakazan za izabrani datum", 400);
        }

        return workoutSessionRepository.upsertSession({
            user: userId,
            workoutPlan: plan._id,
            day,
            date: normalizedDate,
        });
    }

    async function skipDay(userId, requesterRole, {workoutPlan, day, date}){
        const plan = await loadOwnedPlan(workoutPlan, userId, requesterRole);

        if(!day || !mongoose.Types.ObjectId.isValid(day)){
            throw new AppError("Nevažeći ID dana", 400);
        }

        const normalizedDate = normalizeDate(date);
        assertNotFutureDate(normalizedDate);

        const scheduled = await loadActivePlanSchedule(userId, plan, normalizedDate);
        if(!scheduled.day || scheduled.day._id.toString() !== day){
            throw new AppError("Ovaj dan nije zakazan za izabrani datum", 400);
        }

        return workoutSessionRepository.upsertSession({
            user: userId,
            workoutPlan: plan._id,
            day,
            date: normalizedDate,
            status: "skipped",
        });
    }

    async function deleteSession(id, requesterId, requesterRole){
        assertValidId(id);

        const session = await workoutSessionRepository.findById(id);
        if(!session) throw new AppError("Zapis nije pronađen", 404);

        if(requesterRole !== "admin" && session.user.toString() !== requesterId){
            throw new AppError("Nemate pristup ovom zapisu", 403);
        }

        await workoutSessionRepository.deleteById(id);
    }

    return { getNextDay, getSessions, completeDay, skipDay, deleteSession };
}
