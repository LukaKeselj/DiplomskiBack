import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema({
    event: {
        type: String,
        required: true,
        enum: ["LOGIN_FAILED", "USER_BLOCKED", "USER_UNBLOCKED", "USER_DELETED"],
    },
    actorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },
    ip: {
        type: String,
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
    },
},
{timestamps: true}
);

const AuditLog = mongoose.model("AuditLog", auditLogSchema);

export default AuditLog;
