import mongoose from "mongoose";
import dotenv from "dotenv";
import dns from "dns";

dotenv.config();

// Neki ruteri/lokalne mreže odbijaju DNS SRV upite koje zahteva mongodb+srv://,
// pa Node treba da koristi javni DNS server umesto podrazumevanog sa mreže.
dns.setServers(["8.8.8.8", "1.1.1.1"]);

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