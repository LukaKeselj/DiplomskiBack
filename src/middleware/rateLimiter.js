import jwt from "jsonwebtoken";
import ratelimit from "../config/upstash.js"

function getClientKey(req){
    const authHeader = req.headers.authorization;
    if(authHeader && authHeader.startsWith("Bearer ")){
        const token = authHeader.split(" ")[1];
        try{
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            return `user:${decoded.id}`;
        }catch(error){
            // invalid/expired token, fall back to IP below
        }
    }
    return `ip:${req.ip}`;
}

const rateLimiter= async(req,res,next)=>{
    try{
        const{success}=await ratelimit.limit(getClientKey(req));
        if(!success){
            return res.status(429).json({
                message:"Too many requests, please try later"
            })
        }

        next();

    }catch(error){
        console.log("Rate limit error", error);
        next(error);
    }
};

export default rateLimiter;
