import AuditLog from "../models/AuditLog.js";

export function create(data){
    return AuditLog.create(data);
}
