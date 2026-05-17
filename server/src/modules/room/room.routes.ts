import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";

import { create, myRooms, join, leave, deleteRoom } from "./room.controller.js";

const router = Router();

router.post("/create", authMiddleware, create);
router.get("/my", authMiddleware, myRooms);
router.post("/:roomId/join", authMiddleware, join);
router.post("/:roomId/leave", authMiddleware, leave);
router.delete("/:roomId/delete", authMiddleware, deleteRoom);

export default router;
