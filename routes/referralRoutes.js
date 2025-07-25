import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import {
  getAllReferral,
  getReferralCode,
  getReferralTree,
  getReferralSummary,
  getMyReferralUsedInfo,
} from "../controllers/referralController.js";

const router = Router();

// Admin
router.get("/", getAllReferral);

// Authenticated user routes
router.get("/code-link", authenticate, getReferralCode);
router.get("/tree", authenticate, getReferralTree);
router.get("/summary", authenticate, getReferralSummary);
router.get("/my-referral-used", authenticate, getMyReferralUsedInfo);

export default router;
