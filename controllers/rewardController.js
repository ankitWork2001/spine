import RewardWallet from "../models/rewardWalletModel.js";
import ReferralTransaction from "../models/referralTransactionModel.js";

// GET /api/reward-wallet
export const getRewardWallet = async (req, res) => {
  try {
    const userId = req.userId;

    let wallet = await RewardWallet.findOne({ userId });
    if (!wallet) {
      // Auto-create wallet if not found
      wallet = await RewardWallet.create({ userId });
    }

    res.status(200).json({
      success: true,
      message: "Reward wallet fetched",
      rewardBalance: wallet.balance,
      rewardhistory: wallet.transactions
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET /api/reward-history
export const getRewardHistory = async (req, res) => {
  try {
    const userId = req.userId;

    const transactions = await ReferralTransaction.find({ referrerId: userId })
      .populate("referredUserId", "name email")
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      message: "Reward history fetched",
      data: transactions,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};



// ✅ My Referral Income (Referrer earnings)
export const getReferralIncomeDetails = async (req, res) => {
  try {
    const userId = req.userId;

    const referrals = await Referral.find({ referredBy: userId, isCommissionGiven: true })
      .populate("referredUser", "name email username");

    const result = [];

    for (const ref of referrals) {
      const investment = await UserInvestment.findOne({ userId: ref.referredUser._id });
      const rewardAmount = investment ? investment.amount * (ref.commissionPercent / 100) : 0;

      result.push({
        fromUser: ref.referredUser,
        rewardAmount,
        investmentAmount: investment ? investment.amount : 0,
        commissionPercent: ref.commissionPercent,
        date: ref.createdAt,
      });
    }

    res.status(200).json({ success: true, message: "Referral income details fetched", data: result });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};