import mongoose from "mongoose";

const nutritionPlanItemSchema = new mongoose.Schema({
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
});

const nutritionPlanDaySchema = new mongoose.Schema({
    dayOfWeek: {
        type: Number,
        required: true,
        min: 0,
        max: 6,
    },
    items: [nutritionPlanItemSchema],
});

const nutritionPlanSchema = new mongoose.Schema(
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
        days: [nutritionPlanDaySchema],
    },
    {timestamps: true}
);

const NutritionPlan = mongoose.model("NutritionPlan", nutritionPlanSchema);

export default NutritionPlan;
