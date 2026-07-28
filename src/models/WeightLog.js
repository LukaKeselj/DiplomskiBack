import mongoose from "mongoose";

const weightLogSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        date: {
            type: Date,
            required: true,
        },
        weight: {
            type: Number,
            required: true,
        },
    },
    {timestamps: true}
);

weightLogSchema.index({user: 1, date: 1}, {unique: true});

const WeightLog = mongoose.model("WeightLog", weightLogSchema);

export default WeightLog;
