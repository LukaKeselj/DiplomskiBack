import mongoose from "mongoose";

const workoutLogSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        exercise: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Exercise",
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

workoutLogSchema.index({user: 1, exercise: 1, date: 1}, {unique: true});

const WorkoutLog = mongoose.model("WorkoutLog", workoutLogSchema);

export default WorkoutLog;
