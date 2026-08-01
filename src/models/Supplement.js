import mongoose from "mongoose";

const supplementSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        imageUrl: {
            type: String,
            default: "",
        },
        description: {
            type: String,
            default: "",
        },
    },
    {timestamps: true}
);

const Supplement = mongoose.model("Supplement", supplementSchema);

export default Supplement;
