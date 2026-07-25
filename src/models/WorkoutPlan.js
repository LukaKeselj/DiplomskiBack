import mongoose from "mongoose";

const workoutExerciseSchema = new mongoose.Schema({
    exercise: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Exercise",
        required: true,
    },
    targetSets: {
        type: Number,
    },
    targetReps: {
        type: Number,
    },
});

const workoutDaySchema = new mongoose.Schema({
    dayName: {
        type: String,
        required: true,
    },
    exercises: [workoutExerciseSchema],
});

const workoutPlanSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        days: [workoutDaySchema],
    },
    {timestamps: true}
);

const WorkoutPlan = mongoose.model("WorkoutPlan", workoutPlanSchema);

export default WorkoutPlan;
