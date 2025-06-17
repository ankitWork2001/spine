import User from "../models/userModel.js";
import Referral from "../models/referralModel.js";
import Wallet from "../models/walletModel.js";
import Spin from "../models/spinModel.js";
import RewardWallet from "../models/rewardWalletModel.js";
import ReferralTransaction from "../models/referralTransactionModel.js";
import UserInvestment from "../models/userInvestmentModel.js";

// ✅ Get Own Referral Code
export const getReferralCode = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.status(200).json({ success: true, message: "Referral code fetched", code: user.code });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ Give Referral (at signup or later)
export const giveReferral = async (req, res) => {
  try {
    const { referralCode } = req.body;
    const userId = req.userId;

    const alreadyUsed = await Referral.findOne({ referredUser: userId });
    if (alreadyUsed) {
      return res.status(400).json({ success: false, message: "Referral already used." });
    }

    const referrer = await User.findOne({ code: referralCode });
    if (!referrer || referrer._id.toString() === userId.toString()) {
      return res.status(400).json({ success: false, message: "Invalid referral code." });
    }

    await Referral.create({
      referredBy: referrer._id,
      referredUser: userId,
      commissionPercent: 10,
    });

    await Spin.create([
      { resultValue: 0, type: "free", userId: referrer._id },
      { resultValue: 0, type: "free", userId },
    ]);

    referrer.spinCount = (referrer.spinCount || 0) + 1;
    await referrer.save();

    const referredUser = await User.findById(userId);
    referredUser.spinCount = (referredUser.spinCount || 0) + 1;
    await referredUser.save();

    res.status(200).json({ success: true, message: "Referral successfully recorded." });
  } catch (error) {
    console.error("Referral Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ Referral Status (Sent + Received)
export const getReferralStatus = async (req, res) => {
  try {
    const userId = req.userId;

    const sent = await Referral.find({ referredBy: userId }).populate("referredUser", "name email");
    const received = await Referral.findOne({ referredUser: userId })
      .populate("referredBy", "name email")
      .populate("referredUser", "name email");

    res.status(200).json({ sent, received });
  } catch (error) {
    res.status(500).json({ error: error.message });
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

// ✅ Referrals by User ID (Admin)
export const getReferralsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    const referrals = await Referral.find({ referredBy: userId })
      .populate("referredUser", "name email username createdAt")
      .sort({ createdAt: -1 });

    if (!referrals || referrals.length === 0) {
      return res.status(404).json({ success: false, message: "No users found referred by this user" });
    }

    res.status(200).json({ success: true, message: "Referrals fetched", referrals });
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



// ✅ Outflow: My earnings history
export const getMyReferralOutflow = async (req, res) => {
  try {
    const userId = req.userId;

    const records = await ReferralTransaction.find({ referredUserId: userId })
      .populate("referrerId", "name email")
      .sort({ date: -1 });

    res.status(200).json({ success: true, message: "Referral outflow history", data: records });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
