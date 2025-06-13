import InvestmentPlan from "../models/investmentPlanModel.js";
import UserInvestment from "../models/userInvestmentModel.js";
import Wallet from "../models/walletModel.js";
import Referral from "../models/referralModel.js";
import RewardWallet from "../models/rewardWalletModel.js";

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
    const { id } = req.params;
    const userId = req.userId;
    const { amount } = req.body;

    if (!amount || typeof amount !== 'number' || amount <= 0) {
  return res.status(400).json({ success: false, message: "Invalid amount" });
}

const userWallet = await Wallet.findOne({ userId });
    if (!userWallet) {
      return res.status(404).json({ success: false, message: "User wallet not found" });
    }

    const plan = await InvestmentPlan.findById(id);
    if (!plan || amount < plan.minAmount || userWallet.balance < amount) {
      return res.status(400).json({ success: false, message: "Invalid plan or insufficient balance" });
    }

    // Lock the investment amount for the plan duration
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + plan.durationDays);

    userWallet.balance -= amount;
    userWallet.lockedBalance += amount;
    await userWallet.save();

    const userInvestment = await UserInvestment.create({
      userId,
      planId: id,
      amount,
      startDate,
      endDate,
      status: "active",
      lastPayoutDate: null,
    });

    // 💸 Referral reward logic - 10% of amount goes to RewardWallet
    const referral = await Referral.findOne({
      referredUser: userId,
      level: 1,
      isCommissionGiven: { $ne: true },
    });

    if (referral) {
      const referrerId = referral.referredBy;
      const rewardAmount = amount * 0.1;

      let refRewardWallet = await RewardWallet.findOne({ userId: referrerId });
      if (!refRewardWallet) {
        refRewardWallet = new RewardWallet({ userId: referrerId, rewardBalance: rewardAmount });
      } else {
        refRewardWallet.rewardBalance += rewardAmount;
      }
      await refRewardWallet.save();

      referral.isCommissionGiven = true;
      await referral.save();
    }

    res.status(200).json({
      success: true,
      message: "Subscribed successfully. Amount locked.",
      investment: userInvestment,
      userWallet,
    });
  } catch (error) {
    console.error("Error in subscribeInvestment:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
export const getSubscriptionsbyId = async (req, res) => {
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
