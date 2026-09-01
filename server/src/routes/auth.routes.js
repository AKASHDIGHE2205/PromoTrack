import { Router } from "express";
import { login, addUser, getUsers, getUserById, updateUser, toggleUserStatus, getMyProfile, updateMyProfile, changeMyPassword } from "../controllers/auth.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/login", login);
router.get("/me", authenticate, getMyProfile);
router.put("/me", authenticate, updateMyProfile);
router.put("/change-password", authenticate, changeMyPassword);
router.post("/add-user", authenticate, authorize("Admin","Master", "Manager"), addUser);
router.get("/get-users", authenticate, authorize("Admin","Master", "Manager"), getUsers);
router.get("/get-user/:id", authenticate, authorize("Admin","Master", "Manager"), getUserById);
router.put("/update-user/:id", authenticate, authorize("Admin","Master", "Manager"), updateUser);
router.patch("/toggle-status/:id", authenticate, authorize("Admin","Master", "Manager"), toggleUserStatus);

export default router;