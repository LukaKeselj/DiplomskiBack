import express from "express";
import cors from "cors";
import usersRouter from "./routers/usersRouter.js";
import authRouter from "./routers/authRouter.js";
import { connectDB } from "./config/db.js";
import rateLimiter from "./middleware/rateLimiter.js";

const PORT=process.env.PORT

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));

app.use(express.json()); // middleware parses json body

app.use(rateLimiter);

app.use("/api/users",usersRouter);
app.use("/api/auth",authRouter);

connectDB().then(()=>{
    app.listen(PORT,()=>{
        console.log("Server started on port",PORT);
    });
});
