import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import fileUpload from "express-fileupload";
import {
  send,
  getPrivate,
  getRoom,
  edit,
  deleteMsg,
  getLatestFeed,
  uploadMessageFile,
  downloadMessageFile,
} from "./message.controller.js";

const router = Router();

router.post("/send", authMiddleware, send);
router.post(
  "/upload",
  authMiddleware,
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
    createParentPath: true,
  }),
  uploadMessageFile,
);
router.get("/private/:userId", authMiddleware, getPrivate);
router.get("/room/:roomId", authMiddleware, getRoom);
router.get("/latest", authMiddleware, getLatestFeed);

router.patch("/edit", authMiddleware, edit);

router.delete("/delete", authMiddleware, deleteMsg);

router.get("/download/:messageId", authMiddleware, downloadMessageFile);

export default router;
