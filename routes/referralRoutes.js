import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import {
  getAllReferral,
  getReferralCode,
  getReferralTree,
  getMyReferralOutflow,
  getReferralIncomeDetails,
  giveReferral,
  getReferralSummary,      
  getReferralsByUserId,
  getMyReferralUsedInfo
} from "../controllers/referralController.js";

const router = Router();

router.get("/", getAllReferral); // Admin
router.get("/code", authenticate, getReferralCode);
router.post("/refer", authenticate, giveReferral);
router.get("/tree", authenticate, getReferralTree);
router.get("/summary", authenticate, getReferralSummary);        // ✅ NEW
router.get("/user/:userId", authenticate ,getReferralsByUserId);
router.get("/Outflow", authenticate, getMyReferralOutflow);

// in rewardRoutes.js or referralRoutes.js

router.get("/referral-income", authenticate, getReferralIncomeDetails);
router.get("/my-referral-used",authenticate, getMyReferralUsedInfo);




export default router;
