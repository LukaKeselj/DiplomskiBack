import jwt from "jsonwebtoken";

export function requireAuth(req,res,next){
    const authHeader = req.headers.authorization;
    if(!authHeader || !authHeader.startsWith("Bearer ")){
        return res.status(401).json({message:"Authentication required"});
    }

    const token = authHeader.split(" ")[1];

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
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
