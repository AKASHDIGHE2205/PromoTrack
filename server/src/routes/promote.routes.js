import { Router } from "express";
import {
  addPromote,
  getPromotes,
  getPromoteById,
  updatePromote,
  togglePromoteStatus,
} from "../controllers/promote.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/add-promote", authenticate, addPromote);
router.get("/get-promotes", authenticate, getPromotes);
router.get("/get-promote/:id", authenticate, getPromoteById);
router.put("/update-promote/:id", authenticate, updatePromote);
router.patch("/toggle-status/:id", authenticate, togglePromoteStatus);

export default router;
