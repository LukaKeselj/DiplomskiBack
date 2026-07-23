import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import * as userRepository from "../repositories/userRepository.js";
import { AppError } from "../errors/AppError.js";

function toPublicUser(userDoc){
    const user = userDoc.toObject();
    delete user.password;
    return user;
}

export async function login(email, password){
    const user = await userRepository.findByEmail(email);
    if(!user) throw new AppError("Invalid email or password", 401);

    const passwordMatches = await bcrypt.compare(password, user.password);
    if(!passwordMatches) throw new AppError("Invalid email or password", 401);

    const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: "1h"});

    return {token, user: toPublicUser(user)};
}
