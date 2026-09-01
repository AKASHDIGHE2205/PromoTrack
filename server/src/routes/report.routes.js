import { Router } from "express";
import { getMonthlySalesReport } from "../controllers/report.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";

const router = Router();

router.get(
  "/monthly-sales",
  authenticate,
  authorize("Admin", "Master", "Manager"),
  getMonthlySalesReport,
);

export default router;
