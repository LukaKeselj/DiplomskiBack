import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI;

        if (!uri) {
            throw new Error("MONGODB_URI nije definisan u .env fajlu!");
        }

        await mongoose.connect(uri);
        
        console.log("MONGODB CONNECTED SUCCESSFULLY!");
    } catch (error) {
        console.error("Error connecting to MONGODB:", error);
        process.exit(1);
    }
};