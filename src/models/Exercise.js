import mongoose from "mongoose";

export const MUSCLE_GROUPS = ["grudi", "leđa", "noge", "ramena", "ruke", "core"];

const exerciseSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        muscleGroup: {
            type: String,
            enum: MUSCLE_GROUPS,
            required: true,
        },
        equipment: {
            type: String,
            trim: true,
            default: "",
        },
        description: {
            type: String,
            default: "",
        },
        videoUrl: {
            type: String,
            default: "",
        },
    },
    {timestamps: true}
);

const Exercise = mongoose.model("Exercise", exerciseSchema);

export default Exercise;
