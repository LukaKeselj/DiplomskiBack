export function createAuditLogService({ auditLogRepository }){
    async function log(event, {actorId, targetId, ip, metadata} = {}){
        try{
            await auditLogRepository.create({actorId, targetId, ip, metadata, event});
        }catch(error){
            console.error("Failed to write audit log", event, error);
        }
    }

    return { log };
}
