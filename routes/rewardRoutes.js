import { Router } from "express";
import {
  getRewardWallet,
  getRewardHistory,
  getReferralIncomeDetails
} from "../controllers/rewardController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/getreward", authenticate, getRewardWallet);
router.get("/history", authenticate, getRewardHistory);
router.get("/referral-income", authenticate, getReferralIncomeDetails);

export default router;
