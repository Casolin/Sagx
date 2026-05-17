import { Router } from "express";
import {
  getUserNotifications,
  markAsRead,
  getUserUpdatesController,
} from "./notification.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";

const router = Router();

router.get("/", authMiddleware, getUserNotifications);
router.patch("/:id/read", authMiddleware, markAsRead);
router.get("/updates", authMiddleware, getUserUpdatesController);

export default router;
