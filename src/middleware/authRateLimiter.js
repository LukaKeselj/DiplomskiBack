import { authRatelimit, loginRatelimit } from "../config/upstash.js";

function createLimiterMiddleware(limiter){
    return async(req,res,next)=>{
        try{
            const{success}=await limiter.limit(`ip:${req.ip}`);
            if(!success){
                return res.status(429).json({
                    message:"Previše pokušaja, pokušajte ponovo za koji minut"
                })
            }

            next();

        }catch(error){
            console.log("Auth rate limit error", error);
            next(error);
        }
    };
}

export const authRateLimiter = createLimiterMiddleware(authRatelimit);
export const loginRateLimiter = createLimiterMiddleware(loginRatelimit);
