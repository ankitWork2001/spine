import { Router } from "express";
import { getRewardWallet } from "../controllers/rewardController.js";
const router = Router();

router.get('/getreward', getRewardWallet);

export default router;