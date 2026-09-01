import { Router } from "express";
import authRoutes from "../routes/auth.routes.js"
import shopRoutes from "../routes/shop.routes.js"
import itemRoutes from "../routes/item.routes.js"
import promoteRoutes from "../routes/promote.routes.js"
import attendanceRoutes from "../routes/attendance.routes.js"
import dashboardRoutes from "../routes/dashboard.routes.js"
import reportRoutes from "../routes/report.routes.js"
const router = Router();

router.use("/auth", authRoutes);
router.use("/shop", shopRoutes);
router.use("/item", itemRoutes);
router.use("/promote", promoteRoutes);
router.use("/attendance", attendanceRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/report", reportRoutes);

export default router;
