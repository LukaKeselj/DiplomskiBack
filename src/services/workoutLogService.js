import mongoose from "mongoose";
import { AppError } from "../errors/AppError.js";

function assertValidId(id){
    if(!mongoose.Types.ObjectId.isValid(id)){
        throw new AppError("Nevažeći ID", 400);
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

function assertValidWeight(weight){
    if(typeof weight !== "number" || Number.isNaN(weight) || weight <= 0){
        throw new AppError("Kilaža je obavezna i mora biti pozitivan broj", 400);
    }
}

export function createWorkoutLogService({ workoutLogRepository, exerciseRepository }){
    async function assertExerciseExists(exerciseId){
        if(!exerciseId || !mongoose.Types.ObjectId.isValid(exerciseId)){
            throw new AppError("Nevažeći ID vežbe", 400);
        }

        const exercise = await exerciseRepository.findById(exerciseId);
        if(!exercise){
            throw new AppError("Vežba ne postoji", 400);
        }
    }

    async function getAllLogs(userId, {exercise, date} = {}){
        const filter = {};

        if(exercise !== undefined){
            assertValidId(exercise);
            filter.exercise = exercise;
        }
        if(date !== undefined){
            filter.date = normalizeDate(date);
        }

        return workoutLogRepository.findAllByUser(userId, filter);
    }

    async function logWeight(userId, {exercise, date, weight}){
        assertValidWeight(weight);
        await assertExerciseExists(exercise);

        return workoutLogRepository.upsertLog({
            user: userId,
            exercise,
            date: normalizeDate(date),
            weight,
        });
    }

    async function deleteLog(id, requesterId, requesterRole){
        assertValidId(id);

        const log = await workoutLogRepository.findById(id);
        if(!log) throw new AppError("Zapis nije pronađen", 404);

        if(requesterRole !== "admin" && log.user.toString() !== requesterId){
            throw new AppError("Nemate pristup ovom zapisu", 403);
        }

        await workoutLogRepository.deleteById(id);
    }

    return { getAllLogs, logWeight, deleteLog };
}
