import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import * as userRepository from "../repositories/userRepository.js";
import * as mailService from "./mailService.js";
import { AppError } from "../errors/AppError.js";

const EMAIL_VERIFICATION_PURPOSE = "email-verification";
const GOOGLE_REGISTRATION_PURPOSE = "google-registration";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

function toPublicUser(userDoc){
    const user = userDoc.toObject();
    delete user.password;
    return user;
}

function generateAuthToken(user){
    return jwt.sign({id: user._id, role: user.role}, process.env.JWT_SECRET, {expiresIn: "1h"});
}

export function generateVerificationToken(userId){
    return jwt.sign({id: userId, purpose: EMAIL_VERIFICATION_PURPOSE}, process.env.JWT_SECRET, {expiresIn: "1d"});
}

export async function register(data){
    const newUser = await userRepository.create(data);

    const verificationToken = generateVerificationToken(newUser._id);
    const verificationUrl = `${process.env.BASE_URL}/api/auth/verify-email?token=${verificationToken}`;

    try{
        await mailService.sendVerificationEmail(newUser.email, verificationUrl);
    }catch(error){
        console.error("Failed to send verification email", error);
    }

    return toPublicUser(newUser);
}

export async function verifyEmailToken(token){
    let decoded;
    try{
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    }catch(error){
        throw new AppError("Invalid or expired verification link", 400);
    }

    if(decoded.purpose !== EMAIL_VERIFICATION_PURPOSE){
        throw new AppError("Invalid verification link", 400);
    }

    const user = await userRepository.findById(decoded.id);
    if(!user) throw new AppError("User not found", 404);

    if(!user.isVerified){
        user.isVerified = true;
        await user.save();
    }

    return toPublicUser(user);
}

export async function login(email, password){
    const user = await userRepository.findByEmail(email);
    if(!user) throw new AppError("Invalid email or password", 401);

    const passwordMatches = await bcrypt.compare(password, user.password);
    if(!passwordMatches) throw new AppError("Invalid email or password", 401);

    if(!user.isVerified){
        throw new AppError("Please verify your email before logging in", 403);
    }

    const token = generateAuthToken(user);

    return {token, user: toPublicUser(user)};
}

export async function googleAuth(idToken){
    let payload;
    try{
        const ticket = await googleClient.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        payload = ticket.getPayload();
    }catch(error){
        throw new AppError("Invalid Google credential", 401);
    }

    if(!payload.email_verified){
        throw new AppError("Google email is not verified", 400);
    }

    const existingUser = await userRepository.findByEmail(payload.email);

    if(existingUser){
        if(!existingUser.isVerified){
            existingUser.isVerified = true;
            await existingUser.save();
        }
        return {
            isNewUser: false,
            token: generateAuthToken(existingUser),
            user: toPublicUser(existingUser),
        };
    }

    const pendingToken = jwt.sign(
        {
            email: payload.email,
            name: payload.given_name || "",
            surname: payload.family_name || "",
            purpose: GOOGLE_REGISTRATION_PURPOSE,
        },
        process.env.JWT_SECRET,
        {expiresIn: "10m"}
    );

    return {
        isNewUser: true,
        pendingToken,
        name: payload.given_name || "",
        surname: payload.family_name || "",
        email: payload.email,
    };
}

export async function completeGoogleRegistration(pendingToken, {username, height}){
    let decoded;
    try{
        decoded = jwt.verify(pendingToken, process.env.JWT_SECRET);
    }catch(error){
        throw new AppError("Registration session expired, please sign in with Google again", 400);
    }

    if(decoded.purpose !== GOOGLE_REGISTRATION_PURPOSE){
        throw new AppError("Invalid registration token", 400);
    }

    const existingUser = await userRepository.findByEmail(decoded.email);
    if(existingUser){
        throw new AppError("User already exists", 409);
    }

    const randomPassword = crypto.randomBytes(32).toString("hex");
    const newUser = await userRepository.create({
        name: decoded.name,
        surname: decoded.surname,
        username,
        email: decoded.email,
        password: randomPassword,
        height,
        isVerified: true,
    });

    return {token: generateAuthToken(newUser), user: toPublicUser(newUser)};
}
