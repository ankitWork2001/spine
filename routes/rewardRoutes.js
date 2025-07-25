import { Router } from "express";
import {
  getRewardWallet,
  getRewardHistory,
  getMyReferralSummary,
  getReferralBonusHistory
} from "../controllers/rewardController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/getreward", authenticate, getRewardWallet);
router.get("/history", authenticate, getRewardHistory);
router.get('/referral-summary', authenticate, getMyReferralSummary);
router.get('/ReferralBonusHistory', authenticate, getReferralBonusHistory);

export default router;
