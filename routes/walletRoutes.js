import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import { depositFunds, getTransactions, getWalletBalance, withdrawFunds } from "../controllers/walletController.js";
const router = Router();


router.get("/balance",authenticate,getWalletBalance);
router.get("/transactions",authenticate,getTransactions);
router.post("/deposit",authenticate,depositFunds);
router.post("/withdrawal",authenticate,withdrawFunds);

export default router;