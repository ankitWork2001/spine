import express from 'express';
import { verifyAddress, verifyOtp } from '../controllers/verifyAddress.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/verify-address', authenticate, verifyAddress);
router.post('/verify-otp', authenticate, verifyOtp);

export default router;
