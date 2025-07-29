// routes/upiVerificationRoutes.js
import express from "express";
import { requestUpiVerification, verifyUpiOtp } from "../controllers/upiVerificationController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/verify-upid", authenticate, requestUpiVerification);
router.post("/verify-upid/otp", authenticate, verifyUpiOtp);

export default router;
