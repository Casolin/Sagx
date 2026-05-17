import { Router } from "express";
import { getKpis, getMyKpis } from "./kpi.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { authorizeRole } from "../../middlewares/role.middleware.js";

const router = Router();

router.get("/", authMiddleware, authorizeRole(["ADMIN", "MANAGER"]), getKpis);

router.get(
  "/technician",
  authMiddleware,
  authorizeRole(["TECHNICIAN"]),
  getMyKpis,
);

export default router;
