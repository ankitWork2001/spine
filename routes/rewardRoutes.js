import { Router } from "express";
import {
  getRewardWallet,
  getRewardHistory,
  getMyReferralSummary
} from "../controllers/rewardController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/getreward", authenticate, getRewardWallet);
router.get("/history", authenticate, getRewardHistory);
router.get('/referral-summary', authenticate, getMyReferralSummary);


export default router;
