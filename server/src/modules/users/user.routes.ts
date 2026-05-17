import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import {
  profile,
  updateProfileController,
  modifyAvatarController,
  enableTwoFactorController,
  removeTwoFactorController,
  updateUserController,
  deleteUserController,
  getUsersListController,
  getAvailableTechniciansController,
  getDiscoverUsersController,
} from "./user.controller.js";
import { authorizeRole } from "../../middlewares/role.middleware.js";
import fileUpload from "express-fileupload";

const router = Router();

router.get("/profile", authMiddleware, profile);
router.put("/profile", authMiddleware, updateProfileController);
router.put(
  "/profile/avatar",
  authMiddleware,
  fileUpload({ createParentPath: true }),
  modifyAvatarController,
);
router.get("/users/discover", authMiddleware, getDiscoverUsersController);

router.post("/profile/enable-2fa", authMiddleware, enableTwoFactorController);
router.post("/profile/remove-2fa", authMiddleware, removeTwoFactorController);

router.get(
  "/users",
  authMiddleware,
  authorizeRole(["ADMIN"]),
  getUsersListController,
);
router.put(
  "/users/:userId",
  authMiddleware,
  authorizeRole(["ADMIN"]),
  updateUserController,
); // New
router.delete(
  "/users/:userId",
  authMiddleware,
  authorizeRole(["ADMIN"]),
  deleteUserController,
);

router.get(
  "/available-technicians",
  authMiddleware,
  authorizeRole(["ADMIN", "MANAGER"]),
  getAvailableTechniciansController,
);

export default router;
