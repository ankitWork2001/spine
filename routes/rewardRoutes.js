import { Router } from "express";
import {
  getRewardWallet,
  getRewardHistory
} from "../controllers/rewardController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/getreward", authenticate, getRewardWallet);
router.get("/history", authenticate, getRewardHistory);

export default router;
