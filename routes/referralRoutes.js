import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import {
  getAllReferral,
  getReferralCode,
  getReferralTree,
  getReferralSummary,
  getMyReferralUsedInfo,
} from "../controllers/referralController.js";
import { checkUserStatus } from "../middleware/checkuserstatus.js";

const router = Router();

// Admin
router.get("/", getAllReferral);

// Authenticated user routes
router.get("/code-link", authenticate, checkUserStatus, getReferralCode);
router.get("/tree", authenticate, checkUserStatus, getReferralTree);
router.get("/summary", authenticate, checkUserStatus, getReferralSummary);
router.get("/my-referral-used", authenticate, checkUserStatus, getMyReferralUsedInfo);

export default router;
