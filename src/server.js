import express from "express";
import usersRouter from "./routers/usersRouter.js";
import { connectDB } from "./config/db.js";


const PORT=process.env.PORT

const app = express();

connectDB();

app.use(express.json());

app.use("/api/users",usersRouter);

app.listen(PORT,()=>{
    console.log("Server started on port",PORT);
});

//mongodb+srv://<db_username>:ZhCPGVsMPMKGaDtw@cluster0.mau5gmq.mongodb.net/?appName=Cluster0