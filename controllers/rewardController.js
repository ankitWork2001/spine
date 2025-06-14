import RewardWallet  from "../models/rewardWalletModel.js";
import ReferralTransaction from "../models/referralTransactionModel.js";

// GET /api/reward
export const getRewardWallet = async (req, res) => {
  try {
    const userId = req.userId;
    let wallet = await RewardWallet.findOne({ userId });

    if (!wallet) {
      // Create if not exist
      wallet = await RewardWallet.create({ userId });
    }

    res.status(200).json({
      success: true,
      message: "Reward wallet fetched",
      rewardBalance: wallet.rewardBalance
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


export const getRewardHistory = async (req, res) => {
  try {
    const userId = req.userId; // Alice

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