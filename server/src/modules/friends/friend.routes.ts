import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
  getMyFriends,
  getPendingFriendRequests,
} from "./friend.controller.js";

const router = Router();

router.get("/requests", authMiddleware, getPendingFriendRequests);

router.post("/add", authMiddleware, sendFriendRequest);

router.patch("/accept/:id", authMiddleware, acceptFriendRequest);

router.patch("/reject/:id", authMiddleware, rejectFriendRequest);

router.delete("/delete/:friendId", authMiddleware, removeFriend);

router.get("/", authMiddleware, getMyFriends);

export default router;
