import { Router } from "express";
import {
  markAttendance,
  getTodayAttendance,
  getAttendanceReport,
} from "../controllers/attendance.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { uploadSelfie } from "../middlewares/upload.middleware.js";

const router = Router();

router.get("/today", authenticate, getTodayAttendance);
router.post("/check-in", authenticate, uploadSelfie, markAttendance);
router.get(
  "/report",
  authenticate,
  authorize("Admin", "Master", "Manager"),
  getAttendanceReport,
);

export default router;
