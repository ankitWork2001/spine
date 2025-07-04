import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import { getSpinLogs, playSpin, purchaseSpin,getPrizeList,getSpinCount, playSpin2 } from "../controllers/spinController.js";
const router = Router();

router.get("/play", authenticate, playSpin);
router.get("/playtwo", authenticate, playSpin2);
router.post("/purchase", authenticate, purchaseSpin);
router.get("/logs", authenticate, getSpinLogs);
router.get("/prizelist", authenticate,getPrizeList);
router.get("/count", authenticate, getSpinCount);

export default router;
