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

function assertNotFutureDate(date){
    const today = normalizeDate();
    if(date > today){
        throw new AppError("Ne možeš označiti suplement za dan koji još nije došao", 400);
    }
}

export function createSupplementLogService({ supplementLogRepository, userSupplementRepository }){
    async function assertOwnsUserSupplement(supplementId, requesterId){
        assertValidId(supplementId);

        const userSupplement = await userSupplementRepository.findById(supplementId);
        if(!userSupplement){
            throw new AppError("Suplement nije pronađen", 404);
        }
        if(userSupplement.user.toString() !== requesterId){
            throw new AppError("Nemate pristup ovom suplementu", 403);
        }
    }

    async function getAllLogs(userId, {supplement, date} = {}){
        const filter = {};

        if(supplement !== undefined){
            assertValidId(supplement);
            filter.supplement = supplement;
        }
        if(date !== undefined){
            filter.date = normalizeDate(date);
        }

        return supplementLogRepository.findAllByUser(userId, filter);
    }

    async function logSupplementTaken(userId, {supplement, date, taken}){
        if(!supplement){
            throw new AppError("Suplement je obavezan", 400);
        }

        await assertOwnsUserSupplement(supplement, userId);

        const normalizedDate = normalizeDate(date);
        assertNotFutureDate(normalizedDate);

        return supplementLogRepository.upsertLog({
            user: userId,
            supplement,
            date: normalizedDate,
            taken: taken ?? true,
        });
    }

    async function deleteLog(id, requesterId, requesterRole){
        assertValidId(id);

        const log = await supplementLogRepository.findById(id);
        if(!log) throw new AppError("Zapis nije pronađen", 404);

        if(requesterRole !== "admin" && log.user.toString() !== requesterId){
            throw new AppError("Nemate pristup ovom zapisu", 403);
        }

        await supplementLogRepository.deleteById(id);
    }

    return { getAllLogs, logSupplementTaken, deleteLog };
}
