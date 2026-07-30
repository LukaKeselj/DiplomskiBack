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

function normalizeDate(date){
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

function findDayIndex(plan, dayId){
    const index = plan.days.findIndex((day) => day._id.toString() === dayId);
    if(index === -1){
        throw new AppError("Dan ne postoji u ovom planu", 400);
    }
    return index;
}

export function createWorkoutSessionService({ workoutSessionRepository, workoutPlanRepository }){
    async function loadOwnedPlan(workoutPlanId, requesterId, requesterRole){
        assertValidId(workoutPlanId);

        const plan = await workoutPlanRepository.findById(workoutPlanId);
        if(!plan) throw new AppError("Plan nije pronađen", 404);

        assertOwnerOrAdmin(plan, requesterId, requesterRole);

        return plan;
    }

    async function computeExpectedIndex(userId, plan){
        if(plan.days.length === 0) return null;

        const lastSession = await workoutSessionRepository.findLastByUserAndPlan(userId, plan._id);
        if(!lastSession) return 0;

        const lastIndex = plan.days.findIndex((day) => day._id.toString() === lastSession.day.toString());
        if(lastIndex === -1) return 0;

        return (lastIndex + 1) % plan.days.length;
    }

    async function getNextDay(userId, workoutPlanId, requesterRole){
        const plan = await loadOwnedPlan(workoutPlanId, userId, requesterRole);

        const expectedIndex = await computeExpectedIndex(userId, plan);
        if(expectedIndex === null){
            return {day: null, index: null};
        }

        return {day: plan.days[expectedIndex], index: expectedIndex};
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

        const dayIndex = findDayIndex(plan, day);
        const expectedIndex = await computeExpectedIndex(userId, plan);

        if(dayIndex !== expectedIndex){
            throw new AppError("Prvo moraš da završiš prethodni dan u nizu", 400);
        }

        const normalizedDate = normalizeDate(date);
        assertNotFutureDate(normalizedDate);

        return workoutSessionRepository.upsertSession({
            user: userId,
            workoutPlan: plan._id,
            day,
            date: normalizedDate,
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

    return { getNextDay, getSessions, completeDay, deleteSession };
}
