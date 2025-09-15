import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import { depositFunds, getTransactions, getWalletBalance, withdrawFunds } from "../controllers/walletController.js";
// import { checkUpiVerified } from "../middleware/checkUpiVerified.js";
import { checkUserStatus } from "../middleware/checkuserstatus.js";

const router = Router();


router.get("/balance",authenticate, checkUserStatus,getWalletBalance);
router.get("/transactions",authenticate, checkUserStatus,getTransactions);
router.post("/deposit",authenticate, checkUserStatus ,depositFunds); //checkUpiVerified middleware bypassed for deposit
router.post("/withdrawal",authenticate, checkUserStatus,withdrawFunds); //checkUpiVerified middleware bypassed for withdrawal

export default router;