import InvestmentPlan from "../models/investmentPlanModel.js";
import UserInvestment from "../models/userInvestmentModel.js";
import Wallet from "../models/walletModel.js";
import Referral from "../models/referralModel.js";
import RewardWallet from "../models/rewardWalletModel.js";
import ReferralTransaction from "../models/referralTransactionModel.js";

export const getInvestmentPlans = async (req, res) => {
  try {
    const plans = await InvestmentPlan.find();
    if (!plans || plans.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No investment plans found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Plans fetched successfully", plans });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const subscribeInvestment = async (req, res) => {
  try {
    const { id } = req.params; // planId
    const { amount } = req.body;
    const userId = req.userId;

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ success: false, message: "Invalid amount" });
    }

    // Fetch user wallet
    const userWallet = await Wallet.findOne({ userId });
    if (!userWallet) return res.status(404).json({ success: false, message: "User wallet not found" });

    // Fetch investment plan
    const plan = await InvestmentPlan.findById(id);
    if (!plan) return res.status(404).json({ success: false, message: "Investment plan not found" });
    if (amount < plan.minAmount) return res.status(400).json({ success: false, message: "Amount less than minimum required" });
    if (userWallet.balance < amount) return res.status(400).json({ success: false, message: "Insufficient balance" });

    // Deduct amount & lock it
    userWallet.balance -= amount;
    userWallet.lockedBalance += amount;
    await userWallet.save();

    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + plan.durationDays);

    // Create Investment
    const userInvestment = await UserInvestment.create({
      userId,
      planId: id,
      amount,
      startDate,
      endDate,
      status: "active",
      lastPayoutDate: null,
    });

    // Referral Reward Logic
    const referral = await Referral.findOne({ referredUser: userId, isCommissionGiven: false });

    if (referral) {
      const rewardAmount = amount * 0.1;
      const referrerId = referral.referredBy;

      // Update Referrer's Reward Wallet
      let refRewardWallet = await RewardWallet.findOne({ userId: referrerId });
      if (!refRewardWallet) {
        refRewardWallet = await RewardWallet.create({ userId: referrerId, rewardBalance: rewardAmount });
      } else {
        refRewardWallet.rewardBalance += rewardAmount;
        await refRewardWallet.save();
      }

      // Optional: reward referred user (first-time investor)
      let userRewardWallet = await RewardWallet.findOne({ userId });
      if (!userRewardWallet) {
        userRewardWallet = await RewardWallet.create({ userId, rewardBalance: rewardAmount });
      } else {
        userRewardWallet.rewardBalance += rewardAmount;
        await userRewardWallet.save();
      }

      // Mark referral used and log transaction
      referral.isCommissionGiven = true;
      referral.isRewardGiven = true;
      referral.amount = rewardAmount;
      await referral.save();

      await ReferralTransaction.create({
        referrerId,
        referredUserId: userId,
        investmentId: userInvestment._id,
        amount: rewardAmount,
      });
    }

    res.status(200).json({
      success: true,
      message: "Investment successful. Amount locked.",
      investment: userInvestment,
      wallet: userWallet,
    });

  } catch (error) {
    console.error("Error in subscribeInvestment:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getSubscriptionsbyId = async (req, res) => {
  const { id } = req.params;
  try {
   const user = await UserInvestment.findById(id)
  .populate("userId", "name email role status")
  .populate("planId", "name roiPercent minAmount durationDays autoPayout");

if (!user) {
  return res.status(404).json({ success: false, message: "Investment plan not found" });
}

const userWallet = await Wallet.findOne({ userId: user.userId });

    res
      .status(201)
      .json({
        success: true,
        message: "User retrived successfully",
        userDetails: user,
        userWallet,
      });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getActiveInvestments = async (req, res) => {
  try {
    const userId = req.userId;
    const investments = await UserInvestment.find({ userId, status: "active" })
      .populate("planId", "name roiPercent minAmount durationDays autoPayout")
      .exec();
    res
      .status(200)
      .json({
        success: true,
        message: "Active investments fetched",
        investments,
      });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getInvestmentHistory = async (req, res) => {
  try {
    const userId = req.userId;
    const investments = await UserInvestment.find({ userId })
      .populate("planId", "name roiPercent minAmount durationDays autoPayout")
      .exec();
    res
      .status(200)
      .json({
        success: true,
        message: "Investment history fetched",
        investments,
      });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
