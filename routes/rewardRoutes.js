import express from "express";
import { getRewardWallet } from "../controllers/rewardWalletController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware ,getRewardWallet);

export default router;
