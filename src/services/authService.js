import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import * as userRepository from "../repositories/userRepository.js";
import * as refreshTokenRepository from "../repositories/refreshTokenRepository.js";
import * as mailService from "./mailService.js";
import { AppError } from "../errors/AppError.js";
import { comparePassword } from "../utils/passwordUtils.js";
import { isValidEmail, isValidPassword } from "../utils/validators.js";
import * as auditLogService from "./auditLogService.js";

export const ACCESS_TOKEN_PURPOSE = "access";
const EMAIL_VERIFICATION_PURPOSE = "email-verification";
const GOOGLE_REGISTRATION_PURPOSE = "google-registration";
const PASSWORD_RESET_PURPOSE = "password-reset";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

function toPublicUser(userDoc){
    const user = userDoc.toObject();
    delete user.password;
    return user;
}

function generateAccessToken(user){
    return jwt.sign(
        {id: user._id, role: user.role, purpose: ACCESS_TOKEN_PURPOSE},
        process.env.JWT_SECRET,
        {expiresIn: "15m"}
    );
}

async function issueTokens(user){
    const accessToken = generateAccessToken(user);
    const refreshToken = await refreshTokenRepository.create(user._id);
    return {accessToken, refreshToken};
}

export function generateVerificationToken(userId){
    return jwt.sign({id: userId, purpose: EMAIL_VERIFICATION_PURPOSE}, process.env.JWT_SECRET, {expiresIn: "1d"});
}

export async function register(data){
    if(!isValidEmail(data.email)){
        throw new AppError("Email adresa nije validna", 400);
    }
    if(!isValidPassword(data.password)){
        throw new AppError("Šifra mora imati najmanje 8 karaktera", 400);
    }

    const existingUser = await userRepository.findByEmail(data.email);
    if(existingUser){
        throw new AppError("Nalog sa ovim emailom već postoji", 409);
    }

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

export function generatePasswordResetToken(userId){
    return jwt.sign({id: userId, purpose: PASSWORD_RESET_PURPOSE}, process.env.JWT_SECRET, {expiresIn: "30m"});
}

export async function requestPasswordReset(email){
    const user = await userRepository.findByEmail(email);
    if(!user) return;

    const resetToken = generatePasswordResetToken(user._id);
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    await mailService.sendPasswordResetEmail(user.email, resetUrl);
}

export async function resetPassword(token, newPassword){
    let decoded;
    try{
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    }catch(error){
        throw new AppError("Link za reset šifre je nevažeći ili je istekao", 400);
    }

    if(decoded.purpose !== PASSWORD_RESET_PURPOSE){
        throw new AppError("Nevažeći link za reset šifre", 400);
    }

    if(!isValidPassword(newPassword)){
        throw new AppError("Šifra mora imati najmanje 8 karaktera", 400);
    }

    const user = await userRepository.findById(decoded.id);
    if(!user) throw new AppError("User not found", 404);

    user.password = newPassword;
    await user.save();

    await refreshTokenRepository.deleteAllForUser(user._id);
}

export async function login(email, password, ip){
    const user = await userRepository.findByEmail(email);
    if(!user){
        await auditLogService.log("LOGIN_FAILED", {ip, metadata: {email}});
        throw new AppError("Invalid email or password", 401);
    }

    const passwordMatches = await comparePassword(password, user.password);
    if(!passwordMatches){
        await auditLogService.log("LOGIN_FAILED", {targetId: user._id, ip, metadata: {email}});
        throw new AppError("Invalid email or password", 401);
    }

    if(!user.isVerified){
        throw new AppError("Please verify your email before logging in", 403);
    }

    if(user.isBlocked){
        throw new AppError("Your account has been blocked", 403);
    }

    const {accessToken, refreshToken} = await issueTokens(user);

    return {accessToken, refreshToken, user: toPublicUser(user)};
}

export async function refreshSession(rawRefreshToken){
    if(!rawRefreshToken){
        throw new AppError("Refresh token nije prisutan", 401);
    }

    const stored = await refreshTokenRepository.findByRawToken(rawRefreshToken);
    if(!stored || stored.expiresAt < new Date()){
        throw new AppError("Sesija je istekla, prijavite se ponovo", 401);
    }

    const user = await userRepository.findById(stored.user);
    if(!user){
        await refreshTokenRepository.deleteByRawToken(rawRefreshToken);
        throw new AppError("User not found", 404);
    }
    if(user.isBlocked){
        await refreshTokenRepository.deleteByRawToken(rawRefreshToken);
        throw new AppError("Your account has been blocked", 403);
    }

    // rotacija: stari refresh token se poništava čim se iskoristi
    await refreshTokenRepository.deleteByRawToken(rawRefreshToken);

    const {accessToken, refreshToken} = await issueTokens(user);

    return {accessToken, refreshToken, user: toPublicUser(user)};
}

export async function revokeRefreshToken(rawRefreshToken){
    if(!rawRefreshToken) return;
    await refreshTokenRepository.deleteByRawToken(rawRefreshToken);
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
        if(existingUser.isBlocked){
            throw new AppError("Your account has been blocked", 403);
        }

        if(!existingUser.isVerified){
            existingUser.isVerified = true;
            await existingUser.save();
        }

        const {accessToken, refreshToken} = await issueTokens(existingUser);

        return {
            isNewUser: false,
            accessToken,
            refreshToken,
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

    const {accessToken, refreshToken} = await issueTokens(newUser);

    return {accessToken, refreshToken, user: toPublicUser(newUser)};
}
