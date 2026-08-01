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

function getCurrentWeekBoundaries(){
    const start = new Date();
    start.setUTCHours(0, 0, 0, 0);

    const day = start.getUTCDay(); // 0 = nedelja, 1 = ponedeljak, ... 6 = subota
    const diffToMonday = day === 0 ? 6 : day - 1;
    start.setUTCDate(start.getUTCDate() - diffToMonday);

    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 6);

    return {start, end};
}

export function createWeightLogService({ weightLogRepository }){
    async function getAllLogs(userId, {date} = {}){
        const filter = {};
        if(date !== undefined){
            filter.date = normalizeDate(date);
        }
        return weightLogRepository.findAllByUser(userId, filter);
    }

    async function logWeight(userId, {date, weight}){
        assertValidWeight(weight);

        const normalizedDate = normalizeDate(date);

        const log = await weightLogRepository.upsertLog({
            user: userId,
            date: normalizedDate,
            weight,
        });

        return log;
    }

    async function getWeeklyStatus(userId){
        const {start, end} = getCurrentWeekBoundaries();

        const logsThisWeek = await weightLogRepository.findAllByUser(userId, {
            date: {$gte: start, $lte: end},
        });
        const latest = await weightLogRepository.findLatestByUser(userId);

        return {
            hasLoggedThisWeek: logsThisWeek.length > 0,
            currentWeight: latest ? latest.weight : null,
            currentWeightDate: latest ? latest.date.toISOString().slice(0, 10) : null,
        };
    }

    async function deleteLog(id, requesterId, requesterRole){
        assertValidId(id);

        const log = await weightLogRepository.findById(id);
        if(!log) throw new AppError("Zapis nije pronađen", 404);

        if(requesterRole !== "admin" && log.user.toString() !== requesterId){
            throw new AppError("Nemate pristup ovom zapisu", 403);
        }

        await weightLogRepository.deleteById(id);
    }

    return { getAllLogs, logWeight, getWeeklyStatus, deleteLog };
}
