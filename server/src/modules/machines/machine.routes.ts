import { Router } from "express";
import {
  create,
  getAll,
  getOne,
  update,
  remove,
  updateStatus,
} from "./machine.controller.js";

import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { authorizeRole } from "../../middlewares/role.middleware.js";

const router = Router();

router.get("/", authMiddleware, getAll);

router.get("/:machineId", authMiddleware, getOne);

router.post(
  "/create",
  authMiddleware,
  authorizeRole(["ADMIN", "MANAGER"]),
  create,
);

router.put(
  "/:machineId/update",
  authMiddleware,
  authorizeRole(["ADMIN", "MANAGER"]),
  update,
);

router.patch(
  "/:machineId/status",
  authMiddleware,
  authorizeRole(["ADMIN", "MANAGER"]),
  updateStatus,
);

router.delete(
  "/:machineId/delete",
  authMiddleware,
  authorizeRole(["ADMIN", "MANAGER"]),
  remove,
);

export default router;
