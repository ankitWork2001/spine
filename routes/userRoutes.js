import express from "express";
import {
  getRewardWalletTransactions,
  withdrawFromWallet,
} from "../controllers/userController.js"; // 🆕 add new controllers
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// 🆕 Get Reward Wallet Transactions
router.get("/reward-wallet", authMiddleware, getRewardWalletTransactions);

// 🆕 Withdraw from Wallet
router.post("/withdraw", authMiddleware, withdrawFromWallet);

export default router;
