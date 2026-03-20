import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./lib/db.js"
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.route.js"
import messageRoutes from "./routes/message.route.js"
import cors from "cors";
import { app, server } from "./lib/socket.js";



import path from "path";

// const app = express(); deleted because socket.js ma banayu che e use karvanu



dotenv.config({});


const PORT = process.env.PORT || 3000;
const __dirname = path.resolve();


app.use(express.json());
// app.use(express.json({ limit: "50mb" }));
// app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());
app.use(cors({
    origin: true,
    credentials: true
}))

if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../frontend/dist")));


    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
    });
}

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);




server.listen(5001, () => {
    console.log("Server is running at " + PORT);
    connectDB();
})
