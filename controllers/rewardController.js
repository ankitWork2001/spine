import RewardWallet from "../models/rewardWalletModel.js";
import ReferralTransaction from "../models/referralTransactionModel.js";
import User from "../models/userModel.js";
import mongoose from "mongoose";
import Referral from "../models/referralModel.js";


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
      rewardhistory: wallet.transactions,
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

// ✅ Inflow: Summary of referrals for current user
export const getMyReferralSummary = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId).select("code");
    const mycode = user?.code || "";

   const totalReferrals = await Referral.find({ referredBy: userId }).distinct("referredUser");
const activeInvestors = await ReferralTransaction.find({
  referrerId: userId,
  amount: { $gt: 0 }
}).distinct("referredUserId");


    const earningsAgg = await ReferralTransaction.aggregate([
      { $match: { referrerId: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const earnings = earningsAgg.length ? earningsAgg[0].total : 0;

    res.status(200).json({
      success: true,
      data: {
        totalReferrals: totalReferrals.length,
        activeInvestors: activeInvestors.length,
        earnings,
        referralCode: mycode
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
