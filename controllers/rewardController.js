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