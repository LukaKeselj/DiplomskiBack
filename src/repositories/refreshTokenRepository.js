import crypto from "node:crypto";
import RefreshToken from "../models/RefreshToken.js";

export const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 dana

function hashToken(rawToken){
    return crypto.createHash("sha256").update(rawToken).digest("hex");
}

export function createRefreshTokenRepository(){
    async function create(userId){
        const rawToken = crypto.randomBytes(40).toString("hex");

        await RefreshToken.create({
            user: userId,
            tokenHash: hashToken(rawToken),
            expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
        });

        return rawToken;
    }

    function findByRawToken(rawToken){
        return RefreshToken.findOne({tokenHash: hashToken(rawToken)});
    }

    function deleteByRawToken(rawToken){
        return RefreshToken.deleteOne({tokenHash: hashToken(rawToken)});
    }

    function deleteAllForUser(userId){
        return RefreshToken.deleteMany({user: userId});
    }

    return { create, findByRawToken, deleteByRawToken, deleteAllForUser };
}
