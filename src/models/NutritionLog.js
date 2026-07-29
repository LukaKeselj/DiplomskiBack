import mongoose from "mongoose";

const nutritionLogSchema = new mongoose.Schema(
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
        foodName: {
            type: String,
            required: true,
            trim: true,
        },
        foodId: {
            type: String,
        },
        calories: {
            type: Number,
            required: true,
        },
        protein: {
            type: Number,
            required: true,
        },
        fat: {
            type: Number,
            required: true,
        },
        carbs: {
            type: Number,
            required: true,
        },
        fiber: {
            type: Number,
            default: 0,
        },
        nutritionPlanItem: {
            type: mongoose.Schema.Types.ObjectId,
            default: null,
        },
    },
    {timestamps: true}
);

const NutritionLog = mongoose.model("NutritionLog", nutritionLogSchema);

export default NutritionLog;
