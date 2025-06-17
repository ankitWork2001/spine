import express from "express";
import { addPlan, getAllPlans } from "../controllers/planController.js";

const router = express.Router();

router.post("/add-plan", addPlan);     // Admin only
router.get("/plans", getAllPlans);                       // Public

export default router;
