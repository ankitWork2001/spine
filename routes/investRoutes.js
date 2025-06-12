import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import { getActiveInvestments, getInvestmentHistory, getInvestmentPlans, getSubscriptionsbyId, subscribeInvestment } from "../controllers/investController.js";
const router = Router();

router.get("/plans", authenticate,getInvestmentPlans);
router.post("/subscribe/:id", authenticate,subscribeInvestment);
router.get("/subscription/:id",authenticate,getSubscriptionsbyId);
router.get("/active", authenticate,getActiveInvestments);
router.get("/history", authenticate,getInvestmentHistory);
export default router;


