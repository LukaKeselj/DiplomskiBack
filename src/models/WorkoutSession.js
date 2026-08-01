import mongoose from "mongoose";

const workoutSessionSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        workoutPlan: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "WorkoutPlan",
            required: true,
        },
        day: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        date: {
            type: Date,
            required: true,
        },
        status: {
            type: String,
            enum: ["completed", "skipped"],
            default: "completed",
        },
    },
    {timestamps: true}
);

workoutSessionSchema.index({user: 1, day: 1, date: 1}, {unique: true});

const WorkoutSession = mongoose.model("WorkoutSession", workoutSessionSchema);

export default WorkoutSession;
