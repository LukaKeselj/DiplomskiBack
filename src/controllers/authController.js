import * as authService from "../services/authService.js";
import * as userService from "../services/userService.js";
import { AppError } from "../errors/AppError.js";

const ACCESS_TOKEN_COOKIE = "token";
const REFRESH_TOKEN_COOKIE = "refreshToken";
const REFRESH_TOKEN_PATH = "/api/auth";
const isProduction = process.env.NODE_ENV === "production";

const baseCookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
};

const refreshCookieOptions = {
    ...baseCookieOptions,
    path: REFRESH_TOKEN_PATH,
};

function setAuthCookies(res, {accessToken, refreshToken}){
    res.cookie(ACCESS_TOKEN_COOKIE, accessToken, {
        ...baseCookieOptions,
        maxAge: 15 * 60 * 1000, // 15min, mora da prati expiresIn access tokena
    });
    res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
        ...refreshCookieOptions,
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 dana
    });
}

function clearAuthCookies(res){
    res.clearCookie(ACCESS_TOKEN_COOKIE, baseCookieOptions);
    res.clearCookie(REFRESH_TOKEN_COOKIE, refreshCookieOptions);
}

function handleError(res, error, context){
    if(error instanceof AppError){
        return res.status(error.statusCode).json({message: error.message});
    }
    console.error(`Error in ${context} controller`, error);
    res.status(500).json({message:"Internal server error"});
}

export async function register(req,res){
    try{
        const {name,surname,username,email,password,height} = req.body;
        const newUser = await authService.register({name,surname,username,email,password,height});
        res.status(201).json(newUser);
    }catch(error){
        handleError(res, error, "register");
    }
}

export async function login(req,res){
    try{
        const {email,password} = req.body;
        const {accessToken, refreshToken, user} = await authService.login(email, password);
        setAuthCookies(res, {accessToken, refreshToken});
        res.status(200).json({user});
    }catch(error){
        handleError(res, error, "login");
    }
}

export async function googleLogin(req,res){
    try{
        const {credential} = req.body;
        if(!credential) throw new AppError("Google credential is required", 400);
        const result = await authService.googleAuth(credential);

        if(result.isNewUser){
            return res.status(200).json(result);
        }

        setAuthCookies(res, {accessToken: result.accessToken, refreshToken: result.refreshToken});
        res.status(200).json({isNewUser: false, user: result.user});
    }catch(error){
        handleError(res, error, "googleLogin");
    }
}

export async function completeGoogleRegistration(req,res){
    try{
        const {pendingToken, username, height} = req.body;
        const {accessToken, refreshToken, user} = await authService.completeGoogleRegistration(pendingToken, {username, height});
        setAuthCookies(res, {accessToken, refreshToken});
        res.status(201).json({user});
    }catch(error){
        handleError(res, error, "completeGoogleRegistration");
    }
}

export async function refresh(req,res){
    try{
        const rawRefreshToken = req.cookies?.refreshToken;
        const {accessToken, refreshToken, user} = await authService.refreshSession(rawRefreshToken);
        setAuthCookies(res, {accessToken, refreshToken});
        res.status(200).json({user});
    }catch(error){
        clearAuthCookies(res);
        handleError(res, error, "refresh");
    }
}

export async function logout(req,res){
    await authService.revokeRefreshToken(req.cookies?.refreshToken);
    clearAuthCookies(res);
    res.status(200).json({message:"Odjavljeni ste"});
}

export async function me(req,res){
    try{
        const user = await userService.getUserById(req.userId);
        res.status(200).json({user});
    }catch(error){
        handleError(res, error, "me");
    }
}

export async function forgotPassword(req,res){
    try{
        const {email} = req.body;
        if(!email) throw new AppError("Email je obavezan", 400);

        await authService.requestPasswordReset(email);
        res.status(200).json({message:"Ako nalog sa ovim emailom postoji, poslat je link za reset šifre"});
    }catch(error){
        handleError(res, error, "forgotPassword");
    }
}

export async function resetPassword(req,res){
    try{
        const {token, password} = req.body;
        if(!token || !password) throw new AppError("Token i nova šifra su obavezni", 400);

        await authService.resetPassword(token, password);
        res.status(200).json({message:"Šifra je uspješno promijenjena"});
    }catch(error){
        handleError(res, error, "resetPassword");
    }
}

export async function verifyEmail(req,res){
    try{
        const {token} = req.query;
        if(!token) throw new AppError("Verification token is required", 400);

        const user = await authService.verifyEmailToken(token);
        res.status(200).json({message:"Email verified successfully", user});
    }catch(error){
        handleError(res, error, "verifyEmail");
    }
}
