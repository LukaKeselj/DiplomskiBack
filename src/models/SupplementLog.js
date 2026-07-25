import mongoose from "mongoose";

const supplementLogSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        supplement: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "UserSupplement",
            required: true,
        },
        date: {
            type: Date,
            required: true,
        },
        taken: {
            type: Boolean,
            default: false,
        },
    },
    {timestamps: true}
);

supplementLogSchema.index({user: 1, supplement: 1, date: 1}, {unique: true});

const SupplementLog = mongoose.model("SupplementLog", supplementLogSchema);

export default SupplementLog;
