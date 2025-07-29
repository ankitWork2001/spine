import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import { depositFunds, getTransactions, getWalletBalance, withdrawFunds } from "../controllers/walletController.js";
import { checkUpiVerified } from "../middleware/checkUpiVerified.js";
const router = Router();


router.get("/balance",authenticate,getWalletBalance);
router.get("/transactions",authenticate,getTransactions);
router.post("/deposit",authenticate,checkUpiVerified,depositFunds);
router.post("/withdrawal",authenticate,checkUpiVerified,withdrawFunds);

export default router;