import mongoose from "mongoose";

const userSupplementSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        supplement: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Supplement",
            required: true,
        },
        dosage: {
            type: String,
            required: true,
            trim: true,
        },
        timeOfDay: {
            type: String,
            required: true,
            trim: true,
        },
        active: {
            type: Boolean,
            default: true,
        },
    },
    {timestamps: true}
);

const UserSupplement = mongoose.model("UserSupplement", userSupplementSchema);

export default UserSupplement;
