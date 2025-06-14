import User from "../models/userModel.js";
import Referral from "../models/referralModel.js";
import Wallet from "../models/walletModel.js";
import Spin from "../models/spinModel.js";
import ReferralTransaction from "../models/referralTransactionModel.js";

export const getAllReferral = async (req,res) => {
  try {
    const referrals = await Referral.find({}).populate("referredBy").populate("referredUser");
    if(!referrals){
      return res.status(404).json({ success: false, message: "Referrals not found" });    
    }
    res.status(200).json({ success: true, message: "Referral code fetched", referrals});
  } catch (error) {
    res.status(500).json({ success: false, error: error.message }); 
  }
}


export const getReferralCode = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, message: "Referral code fetched", code: user.code });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const giveReferral = async (req, res) => {
  try {
    const { referralCode } = req.body;
    const userId = req.userId;

    const alreadyUsed = await Referral.findOne({ referredUser: userId });
    if (alreadyUsed) {
      return res.status(400).json({ success: false, message: "Referral already used." });
    }

    const referrer = await User.findOne({ code: referralCode });
    if (!referrer) {
      return res.status(404).json({ success: false, message: "Referrer not found" });
    }

    if (referrer._id.toString() === userId.toString()) {
    return res.status(400).json({ success: false, message: "You cannot use your own referral code." });
    }


    await Referral.create({
      referredBy: referrer._id,
      referredUser: userId,
      commissionPercent: 10,
    });

    const spinData = {
      resultValue: 0,
      type: "free",
    };

    await Spin.create([
      { ...spinData, userId: referrer._id },
      { ...spinData, userId },
    ]);

    referrer.spinCount = (referrer.spinCount || 0) + 1;
    await referrer.save();

    const referredUser = await User.findById(userId);
    if (referredUser) {
      referredUser.spinCount = (referredUser.spinCount || 0) + 1;
      await referredUser.save();
    }

    res.status(200).json({ success: true, message: "Referral successfully recorded." });
  } catch (error) {
    console.error("Referral Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};


export const getReferralTree = async (req, res) => {
  try {
    const userId = req.userId;
    const referralTree = await Referral.find({ referredBy: userId })
  .populate("referredUser", "name username email mobile role")
  .exec();
   if (!referralTree || referralTree.length === 0) {
  return res.status(200).json({ success: true, message: "Not Referred Yet", referralTree: [] });
}
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};



// GET /api/referral/summary
export const getReferralSummary = async (req, res) => {
  try {
    const userId = req.userId;

    // Get all referrals where current user referred others
    const referrals = await Referral.find({ referredBy: userId })
      .populate("referredUser", "name email username createdAt")
      .sort({ createdAt: -1 });

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
          createdAt: ref.createdAt
        }))
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET /api/referral/user/:userId
export const getReferralsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    const referrals = await Referral.find({ referredBy: userId })
      .populate("referredUser", "name email username createdAt")
      .sort({ createdAt: -1 });

    if (!referrals || referrals.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No users found referred by this user"
      });
    }

    res.status(200).json({
      success: true,
      message: "Referrals fetched",
      referrals
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


export const getMyReferralOutflow = async (req, res) => {
  try {
    const userId = req.userId; // Jack

    const records = await ReferralTransaction.find({ referredUserId: userId })
      .populate("referrerId", "name email")
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      message: "Referral outflow history",
      data: records,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


// GET /api/referral/my-referral-used
export const getMyReferralUsedInfo = async (req, res) => {
  try {
    const userId = req.userId;

    const referral = await Referral.findOne({ referredUser: userId })
      .populate("referredBy", "name email username")
      .exec();

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


// GET /api/reward/referral-income
export const getReferralIncomeDetails = async (req, res) => {
  try {
    const userId = req.userId;

    const referrals = await Referral.find({ referredBy: userId, isCommissionGiven: true })
      .populate("referredUser", "name email username")
      .exec();

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

    res.status(200).json({
      success: true,
      message: "Referral income details fetched",
      data: result,
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
