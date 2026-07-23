import * as authService from "../services/authService.js";
import { AppError } from "../errors/AppError.js";

export async function login(req,res){
    try{
        const {email,password} = req.body;
        const result = await authService.login(email, password);
        res.status(200).json(result);
    }catch(error){
        if(error instanceof AppError){
            return res.status(error.statusCode).json({message: error.message});
        }
        console.error("Error in login controller", error);
        res.status(500).json({message:"Internal server error"});
    }
}
