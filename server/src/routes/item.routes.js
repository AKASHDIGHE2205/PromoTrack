import { Router } from "express";
import {
  addItem,
  getItems,
  getItemById,
  updateItem,
  toggleItemStatus,
  getActiveItems,
} from "../controllers/item.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/add-item", authenticate, authorize("Admin", "Master", "Manager"), addItem);
router.get("/get-active-items", authenticate, getActiveItems);
router.get("/get-items", authenticate, authorize("Admin", "Master", "Manager"), getItems);
router.get("/get-item/:id", authenticate, authorize("Admin", "Master", "Manager"), getItemById);
router.put("/update-item/:id", authenticate, authorize("Admin", "Master", "Manager"), updateItem);
router.patch("/toggle-status/:id", authenticate, authorize("Admin", "Master", "Manager"), toggleItemStatus);

export default router;
