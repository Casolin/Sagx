import express from "express";
import "dotenv/config";
import authRouters from "./modules/auth/auth.routes.js";
import userRoutes from "./modules/users/user.routes.js";
import missionRoutes from "./modules/missions/mission.routes.js";
import kpiRoutes from "./modules/kpi/kpi.routes.js";
import materialRoutes from "./modules/materials/material.routes.js";
import friendRoutes from "./modules/friends/friend.routes.js";
import roomRoutes from "./modules/room/room.routes.js";
import chatRoutes from "./modules/message/message.routes.js";
import assistantRoutes from "./modules/ai/assistant/assistant.routes.js";
import notificationRoutes from "./modules/notification/notification.routes.js";
import logRoutes from "./modules/logs/activitylog.routes.js";
import alertRoutes from "./modules/alert/alert.routes.js";
import machineRoutes from "./modules/machines/machine.routes.js";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: process.env.VITE_API_URL,
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRouters);

app.use("/api/user", userRoutes);

app.use("/api/mission", missionRoutes);

app.use("/api/kpi", kpiRoutes);

app.use("/api/materials", materialRoutes);

app.use("/api/friends", friendRoutes);

app.use("/api/room", roomRoutes);

app.use("/api/chat/message", chatRoutes);

app.use("/api/ai", assistantRoutes);

app.use("/api/notification", notificationRoutes);

app.use("/api/logs", logRoutes);

app.use("/api/alerts", alertRoutes);

app.use("/api/machines", machineRoutes);

app.get("/", (req, res) => {
  res.send("API is running");
});

export default app;
