import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import {
  getAllReferral,
  getReferralCode,
  getReferralCommissions,
  getReferralTree,
  giveReferral,
  getReferralSummary,      
  getReferralsByUserId      // OPTIONAL - admin
} from "../controllers/referralController.js";

const router = Router();

router.get("/", getAllReferral); // Admin
router.get("/code", authenticate, getReferralCode);
router.post("/refer", authenticate, giveReferral);
router.get("/tree", authenticate, getReferralTree);
router.get("/commissions", authenticate, getReferralCommissions);
router.get("/summary", authenticate, getReferralSummary);        // ✅ NEW
router.get("/user/:userId", getReferralsByUserId);               // Optional

export default router;
