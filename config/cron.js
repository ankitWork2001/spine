import cron from 'node-cron';
import UserInvestment from '../models/userInvestmentModel.js';
import Wallet from '../models/walletModel.js';
import InvestmentPlan from '../models/investmentPlanModel.js';
import Notification from '../models/notificationModel.js';

// Runs every day at midnight
cron.schedule('*/1 * * * *', async () => {
  console.log('🔁 Running Auto Payout Job...');

  try {
    const activeInvestments = await UserInvestment.find({ status: 'active' });

    for (let investment of activeInvestments) {
      const plan = await InvestmentPlan.findById(investment.planId);
      const userWallet = await Wallet.findOne({ userId: investment.userId });

      if (!plan || !userWallet) continue;

      const today = new Date();
      const endDate = new Date(investment.endDate);

      if (today >= endDate) {
        const roiAmount = (investment.amount * plan.roiPercent * plan.durationDays) / 100;

        userWallet.balance += roiAmount;
        userWallet.lockedBalance -= investment.amount;
        userWallet.balance += investment.amount;
        await userWallet.save();

        investment.status = 'completed';
        investment.lastPayoutDate = today;
        await investment.save();

        console.log(`✅ Credited ROI of $${roiAmount} and unlocked funds for user ${investment.userId}`);

        // ✅ Save notification for this user
        await Notification.create({
          userId: investment.userId,
          message: `Your investment plan has completed. ROI of $${roiAmount} and your locked funds of $${investment.amount} have been credited.`
        });
      }
    }

    console.log('✅ Auto payout job finished.');
  } catch (error) {
    console.error('❌ Error in auto payout job:', error.message);
  }
});
