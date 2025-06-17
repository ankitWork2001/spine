// routes/investmentRoutes.js
import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import {
  getInvestmentPlans,
  subscribeInvestment,
  getSubscriptionsbyId,
  getActiveInvestments,
  getInvestmentHistory
} from "../controllers/investController.js";

const router = Router();

// Public
router.get("/plans",authenticate ,getInvestmentPlans);

// Authenticated
router.post("/subscribe/:id", authenticate, subscribeInvestment);
router.get("/my-active", authenticate, getActiveInvestments);
router.get("/my-history", authenticate, getInvestmentHistory);

// Admin / or authorized
router.get("/:id", authenticate, getSubscriptionsbyId); 

export default router;
