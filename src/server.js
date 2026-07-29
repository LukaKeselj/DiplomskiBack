import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import usersRouter from "./routers/usersRouter.js";
import authRouter from "./routers/authRouter.js";
import exercisesRouter from "./routers/exercisesRouter.js";
import workoutPlansRouter from "./routers/workoutPlansRouter.js";
import supplementsRouter from "./routers/supplementsRouter.js";
import userSupplementsRouter from "./routers/userSupplementsRouter.js";
import supplementLogsRouter from "./routers/supplementLogsRouter.js";
import foodRouter from "./routers/foodRouter.js";
import nutritionLogsRouter from "./routers/nutritionLogsRouter.js";
import nutritionPlansRouter from "./routers/nutritionPlansRouter.js";
import weightLogsRouter from "./routers/weightLogsRouter.js";
import workoutLogsRouter from "./routers/workoutLogsRouter.js";
import workoutSessionsRouter from "./routers/workoutSessionsRouter.js";
import { connectDB } from "./config/db.js";
import rateLimiter from "./middleware/rateLimiter.js";

const PORT=process.env.PORT

const app = express();

app.use(helmet());

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true }));

app.use(cookieParser());

app.use(express.json({ limit: "5mb" })); // middleware parses json body (raised to fit base64 profile images)

app.use(rateLimiter);

app.use("/api/users",usersRouter);
app.use("/api/auth",authRouter);
app.use("/api/exercises",exercisesRouter);
app.use("/api/workout-plans",workoutPlansRouter);
app.use("/api/supplements",supplementsRouter);
app.use("/api/user-supplements",userSupplementsRouter);
app.use("/api/supplement-logs",supplementLogsRouter);
app.use("/api/foods",foodRouter);
app.use("/api/nutrition-logs",nutritionLogsRouter);
app.use("/api/nutrition-plans",nutritionPlansRouter);
app.use("/api/weight-logs",weightLogsRouter);
app.use("/api/workout-logs",workoutLogsRouter);
app.use("/api/workout-sessions",workoutSessionsRouter);

connectDB().then(()=>{
    app.listen(PORT,()=>{
        console.log("Server started on port",PORT);
    });
});
