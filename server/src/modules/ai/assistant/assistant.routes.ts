import { Router } from "express";
import { assistantHandler } from "./assistant.controller.js";
import { authMiddleware } from "../../../middlewares/auth.middleware.js";

const router = Router();

router.post("/assistant", authMiddleware, assistantHandler);

export default router;
