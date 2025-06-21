import { Router } from "express";
import {
  getEmployeeById,
  updateUser,
  uploadAvatar,
  getRewardWalletTransactions,
  withdrawFromWallet,
  getUserDashboardSummary
} from "../controllers/userController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/dashboardsummary", authenticate, getUserDashboardSummary);
router.get("/:employeeId", getEmployeeById);
router.put("/update", authenticate, updateUser);
router.post("/avatar", authenticate, uploadAvatar);
router.get("/reward-wallet", authenticate, getRewardWalletTransactions);
router.post("/withdraw", authenticate, withdrawFromWallet);


export default router;
