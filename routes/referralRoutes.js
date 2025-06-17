import express from "express";
import { getReferralStatus } from "../controllers/referralController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, getReferralStatus);

export default router;
