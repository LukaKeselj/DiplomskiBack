import crypto from "node:crypto";
import bcrypt from "bcryptjs";

function applyPepper(plainPassword){
    const pepper = process.env.PASSWORD_PEPPER;
    if(!pepper){
        throw new Error("PASSWORD_PEPPER nije podešen u .env fajlu");
    }
    return crypto.createHmac("sha256", pepper).update(plainPassword).digest("hex");
}

export function hashPassword(plainPassword){
    return bcrypt.hash(applyPepper(plainPassword), 10);
}

export function comparePassword(plainPassword, hash){
    return bcrypt.compare(applyPepper(plainPassword), hash);
}
