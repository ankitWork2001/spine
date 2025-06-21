import { Router } from "express";
import { authenticate, checkAdmin } from "../middleware/authMiddleware.js";
import { createInvestmentPlan, deletePlans, getAllDeposits, getAllUsers, getDashboardStats, toggleUserStatus,getSpinLogs, getReferralStats, getAllWithdrawals, updateInvestmentPlan, getAllInvestmentPlans, getUser, getAllUserInvestments, toggleDepositStatus, toggleWithdrawalStatus, getAllTransactionReports, approvewithdrawals } from "../controllers/adminController.js";


const router = Router();

router.get('/dashboard', authenticate, checkAdmin, getDashboardStats);

router.get('/approvewithdrawals', authenticate, checkAdmin, approvewithdrawals);

router.post('/investment/plan',authenticate,checkAdmin,createInvestmentPlan);

router.get('/investment/plans', authenticate, checkAdmin, getAllInvestmentPlans)

router.get('/userinvestments',authenticate, checkAdmin, getAllUserInvestments);

router.put('/investment/updateplan/:id',authenticate, checkAdmin, updateInvestmentPlan);

router.get('/users', authenticate, checkAdmin, getAllUsers);

router.get('/user/:id',authenticate, checkAdmin, getUser);

router.post('/user/:id/ban', authenticate, checkAdmin,toggleUserStatus );

router.put('/depositstatus/:id', authenticate, checkAdmin, toggleDepositStatus);

router.put('/withdrawalstatus/:id', authenticate, checkAdmin, toggleWithdrawalStatus);

router.get('/transactions', authenticate, checkAdmin, getAllTransactionReports);

router.get('/wallet/deposits', authenticate, checkAdmin,getAllDeposits);

router.get('/wallet/withdrawals',authenticate,checkAdmin,getAllWithdrawals);

router.get('/spins/logs', authenticate, checkAdmin, getSpinLogs);

router.get('/referrals', authenticate, checkAdmin,getReferralStats);

router.delete('/deleteplan/:id', authenticate, deletePlans);

export default router;
