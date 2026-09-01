import { Router } from "express";
import {
  addShop,
  getShops,
  getShopById,
  updateShop,
  toggleShopStatus,
  getActiveShops,
} from "../controllers/shop.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/add-shop", authenticate, authorize("Admin", "Master", "Manager"), addShop);
router.get("/get-shops", authenticate, authorize("Admin", "Master", "Manager"), getShops);
router.get("/get-active-shops", authenticate, getActiveShops);
router.get("/get-shop/:id", authenticate, authorize("Admin", "Master", "Manager"), getShopById);
router.put("/update-shop/:id", authenticate, authorize("Admin", "Master", "Manager"), updateShop);
router.patch("/toggle-status/:id", authenticate, authorize("Admin", "Master", "Manager"), toggleShopStatus);

export default router;
