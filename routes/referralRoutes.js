import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import {
  getAllReferral,
  getReferralCode,
  getReferralTree,
  getMyReferralOutflow,
  giveReferral,
  getReferralSummary,
  getReferralsByUserId,
  getMyReferralUsedInfo,
} from "../controllers/referralController.js";

const router = Router();

// Admin
router.get("/", getAllReferral);

// Authenticated user routes
router.get("/code", authenticate, getReferralCode);
router.post("/refer", authenticate, giveReferral);
router.get("/tree", authenticate, getReferralTree);
router.get("/summary", authenticate, getReferralSummary);
router.get("/user/:userId", authenticate, getReferralsByUserId);
router.get("/outflow", authenticate, getMyReferralOutflow);
router.get("/my-referral-used", authenticate, getMyReferralUsedInfo);

export default router;
