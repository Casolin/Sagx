import { Router } from "express";
import {
  create,
  getAll,
  diagnose,
  getOne,
  update,
  updateStatus,
  remove,
} from "./alert.controller.js";

import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { authorizeRole } from "../../middlewares/role.middleware.js";

const router = Router();

router.get("/", authMiddleware, getAll);

router.get("/:alertId", authMiddleware, getOne);

router.post(
  "/create",
  authMiddleware,
  authorizeRole(["TECHNICIAN", "ADMIN", "MANAGER"]),
  create,
);

router.patch(
  "/:alertId/diagnose",
  authMiddleware,
  authorizeRole(["TECHNICIAN", "MANAGER", "ADMIN"]),
  diagnose,
);

router.patch(
  "/:alertId/update",
  authMiddleware,
  authorizeRole(["ADMIN", "MANAGER"]),
  update,
);

router.patch(
  "/:alertId/status",
  authMiddleware,
  authorizeRole(["ADMIN", "MANAGER"]),
  updateStatus,
);

router.delete(
  "/:alertId/delete",
  authMiddleware,
  authorizeRole(["ADMIN", "MANAGER"]),
  remove,
);

export default router;
