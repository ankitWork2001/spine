import User from "../models/userModel.js";
import Referral from "../models/referralModel.js";
import Wallet from "../models/walletModel.js";
import Spin from "../models/spinModel.js";
import RewardWallet from "../models/rewardWalletModel.js";
import ReferralTransaction from "../models/referralTransactionModel.js";
import UserInvestment from "../models/userInvestmentModel.js";

// ✅ Get Own Referral Code & Referral link
export const getReferralCode = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const referralCode = user.code;
    const referralLink = `https://yourbackend.com/r/${referralCode}`;

    res.status(200).json({
      success: true,
      message: "Referral code fetched",
      code: referralCode,
      referralLink: referralLink
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


// ✅ Referral Tree
export const getReferralTree = async (req, res) => {
  try {
    const userId = req.userId;
    const referralTree = await Referral.find({ referredBy: userId }).populate("referredUser", "name username email mobile role");
    res.status(200).json({ success: true, message: "Referral tree fetched", referralTree });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ Referral Summary
export const getReferralSummary = async (req, res) => {
  try {
    const userId = req.userId;
    const referrals = await Referral.find({ referredBy: userId }).populate("referredUser", "name email username createdAt").sort({ createdAt: -1 });

    const totalReferrals = referrals.length;
    const totalCommission = referrals.reduce((sum, ref) =>
      ref.isCommissionGiven ? sum + ref.commissionPercent : sum, 0
    );

    res.status(200).json({
      success: true,
      message: "Referral summary fetched",
      data: {
        totalReferrals,
        totalCommission,
        referrals: referrals.map(ref => ({
          referredUser: ref.referredUser,
          isCommissionGiven: ref.isCommissionGiven,
          createdAt: ref.createdAt,
        }))
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ All Referrals (Admin use)
export const getAllReferral = async (req, res) => {
  try {
    const referrals = await Referral.find({}).populate("referredBy").populate("referredUser");
    res.status(200).json({ success: true, message: "All referrals fetched", referrals });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ My Referral Used Info
export const getMyReferralUsedInfo = async (req, res) => {
  try {
    const userId = req.userId;

    const referral = await Referral.findOne({ referredUser: userId })
      .populate("referredBy", "name email username");

    if (!referral) {
      return res.status(404).json({ success: false, message: "No referral used by you" });
    }

    const investment = await UserInvestment.findOne({ userId });

    const rewardAmountGiven = investment ? investment.amount * (referral.commissionPercent / 100) : 0;

    res.status(200).json({
      success: true,
      message: "Your referral usage info fetched",
      data: {
        referrer: referral.referredBy,
        investmentAmount: investment ? investment.amount : 0,
        rewardGivenToReferrer: rewardAmountGiven,
        commissionPercent: referral.commissionPercent,
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
