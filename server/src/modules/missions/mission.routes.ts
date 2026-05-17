import { Router } from "express";
import {
  create,
  getAll,
  getOne,
  update,
  remove,
  updateTaskStatus,
} from "./mission.controller.js";

import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { authorizeRole } from "../../middlewares/role.middleware.js";

const router = Router();

router.get("/", authMiddleware, getAll);

router.get("/:missionId", authMiddleware, getOne);

router.post(
  "/create",
  authMiddleware,
  authorizeRole(["ADMIN", "MANAGER"]),
  create,
);

router.put(
  "/:missionId/update",
  authMiddleware,
  authorizeRole(["ADMIN", "MANAGER"]),
  update,
);

router.delete(
  "/:missionId/delete",
  authMiddleware,
  authorizeRole(["ADMIN", "MANAGER"]),
  remove,
);

router.patch(
  "/:missionId/tasks/:taskId/status",
  authMiddleware,
  authorizeRole(["TECHNICIAN", "ADMIN", "MANAGER"]),
  updateTaskStatus,
);

export default router;
