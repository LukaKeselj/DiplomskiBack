import jwt from "jsonwebtoken";
import { ACCESS_TOKEN_PURPOSE } from "../services/authService.js";

function extractToken(req){
    if(req.cookies?.token){
        return req.cookies.token;
    }

    const authHeader = req.headers.authorization;
    if(authHeader && authHeader.startsWith("Bearer ")){
        return authHeader.split(" ")[1];
    }

    return null;
}

export function requireAuth(req,res,next){
    const token = extractToken(req);
    if(!token){
        return res.status(401).json({message:"Authentication required"});
    }

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if(decoded.purpose !== ACCESS_TOKEN_PURPOSE){
            return res.status(401).json({message:"Invalid or expired token"});
        }

        req.userId = decoded.id;
        req.userRole = decoded.role;
        next();
    }catch(error){
        return res.status(401).json({message:"Invalid or expired token"});
    }
}

export function requireAdmin(req,res,next){
    if(req.userRole !== "admin"){
        return res.status(403).json({message:"Admin access required"});
    }
    next();
}

export function requireSelfOrAdmin(req,res,next){
    if(req.userRole === "admin" || req.userId === req.params.id){
        return next();
    }
    return res.status(403).json({message:"Forbidden"});
}
