import cron from 'node-cron';
import UserInvestment from '../models/userInvestmentModel.js';
import Wallet from '../models/walletModel.js';
import InvestmentPlan from '../models/investmentPlanModel.js';
import Notification from '../models/notificationModel.js';

// Runs every 5 minutes
cron.schedule('*/5 * * * *', async () => {
  console.log('🔁 Running Auto Payout Job...');

  try {
    const activeInvestments = await UserInvestment.find({ status: 'active' });

    for (let investment of activeInvestments) {
      const plan = await InvestmentPlan.findById(investment.planId);
      const userWallet = await Wallet.findOne({ userId: investment.userId });

      if (!plan || !userWallet) continue;

      const today = new Date();
      const startDate = new Date(investment.startDate);
      const endDate = new Date(investment.endDate);
      const lastPayout = investment.lastPayoutDate;

      // 1️⃣ Handle autoPayout daily ROI
      if (plan.autoPayout) {
        const daysDiff = Math.floor((today - lastPayout) / (1000 * 60 * 60 * 24));
        if (daysDiff >= 1 && today < endDate) { // pay daily only before endDate
          const dailyROI = (investment.amount * plan.roiPercent / 100) / plan.durationDays;
          const totalROI = dailyROI * daysDiff;

          userWallet.balance += totalROI;
          await userWallet.save();

          investment.lastPayoutDate = today;
          await investment.save();

          await Notification.create({
            userId: investment.userId,
            message: `You received daily ROI of $${totalROI.toFixed(2)} for your investment.`
          });

          console.log(`✅ Credited $${totalROI.toFixed(2)} daily ROI to user ${investment.userId}`);
        }
      }

      // 2️⃣ Handle investment completion
      if (today >= endDate) {
        let finalROI = 0;

        if (!plan.autoPayout) {
          // Full ROI at end for non-auto plans
          finalROI = (investment.amount * plan.roiPercent) / 100;
        } else {
          // Remaining ROI for autoPayout plans
          const daysPaid = Math.floor((lastPayout - startDate) / (1000 * 60 * 60 * 24));
          const totalPaidROI = (investment.amount * plan.roiPercent / 100 / plan.durationDays) * daysPaid;
          finalROI = (investment.amount * plan.roiPercent / 100) - totalPaidROI;
        }

        userWallet.balance += investment.amount + finalROI; // unlock principal + remaining ROI
        userWallet.lockedBalance -= investment.amount;
        await userWallet.save();

        investment.status = 'completed';
        investment.lastPayoutDate = today;
        await investment.save();

        await Notification.create({
          userId: investment.userId,
          message: `Your investment plan has completed. ROI of $${finalROI.toFixed(2)} and your principal $${investment.amount} have been credited.`
        });

        console.log(`✅ Investment completed for user ${investment.userId}`);
      }
    }

    console.log('✅ Auto payout job finished.');
  } catch (error) {
    console.error('❌ Error in auto payout job:', error.message);
  }
});



// import cron from 'node-cron';
// import UserInvestment from '../models/userInvestmentModel.js';
// import Wallet from '../models/walletModel.js';
// import InvestmentPlan from '../models/investmentPlanModel.js';
// import Notification from '../models/notificationModel.js';

// // Runs every day at midnight
// cron.schedule('*/1 * * * *', async () => {
//   console.log('🔁 Running Auto Payout Job...');

//   try {
//     const activeInvestments = await UserInvestment.find({ status: 'active' });

//     for (let investment of activeInvestments) {
//       const plan = await InvestmentPlan.findById(investment.planId);
//       const userWallet = await Wallet.findOne({ userId: investment.userId });

//       if (!plan || !userWallet) continue;

//       const today = new Date();
//       const endDate = new Date(investment.endDate);

//       if (today >= endDate) {
//        const roiAmount = (investment.amount * plan.roiPercent) / 100;
       
//         userWallet.balance += roiAmount;
//         userWallet.lockedBalance -= investment.amount;
//         userWallet.balance += investment.amount;
//         await userWallet.save();

//         investment.status = 'completed';
//         investment.lastPayoutDate = today;
//         await investment.save();

//         console.log(`✅ Credited ROI of $${roiAmount} and unlocked funds for user ${investment.userId}`);

//         // ✅ Save notification for this user
//         await Notification.create({
//           userId: investment.userId,
//           message: `Your investment plan has completed. ROI of $${roiAmount} and your locked funds of $${investment.amount} have been credited.`
//         });
//       }
//     }

//     console.log('✅ Auto payout job finished.');
//   } catch (error) {
//     console.error('❌ Error in auto payout job:', error.message);
//   }
// });
