import AuditLog from "../models/AuditLog.js";

export function createAuditLogRepository(){
    function create(data){
        return AuditLog.create(data);
    }

    return { create };
}
