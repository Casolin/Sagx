import { Router } from "express";
import { getAllLogs } from "./activitylog.controller.js";

const router = Router();

router.get("/", getAllLogs);

export default router;
