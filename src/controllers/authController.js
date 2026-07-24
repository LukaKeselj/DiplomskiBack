import * as authService from "../services/authService.js";
import { AppError } from "../errors/AppError.js";

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
        const result = await authService.login(email, password);
        res.status(200).json(result);
    }catch(error){
        handleError(res, error, "login");
    }
}

export async function googleLogin(req,res){
    try{
        const {credential} = req.body;
        if(!credential) throw new AppError("Google credential is required", 400);
        const result = await authService.googleAuth(credential);
        res.status(200).json(result);
    }catch(error){
        handleError(res, error, "googleLogin");
    }
}

export async function completeGoogleRegistration(req,res){
    try{
        const {pendingToken, username, height} = req.body;
        const result = await authService.completeGoogleRegistration(pendingToken, {username, height});
        res.status(201).json(result);
    }catch(error){
        handleError(res, error, "completeGoogleRegistration");
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
