import User from "../models/userModel.js";
import Referral from "../models/referralModel.js";
import Wallet from "../models/walletModel.js";
import Spin from "../models/spinModel.js";

export const getAllReferral = async (req,res) => {
  try {
    const referrals = await Referral.find({});
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

    // Check if the user has already been referred
    const existingReferral = await Referral.findOne({ referredId: userId, level: 1 });
    if (existingReferral) {
      return res.status(400).json({ success: false, message: "Referral already used." });
    }

    // Find the level 1 referrer using referral code
    const referrer = await User.findOne({ code: referralCode });
    if (!referrer) {
      return res.status(404).json({ success: false, message: "Referrer not found" });
    }

    // Create Level 1 referral
    await Referral.create({
      referrerId: referrer._id,
      referredId: userId,
      level: 1,
      commissionPercent: 10
    });

    // Give both users one free spin
    const freeSpin = {
      resultValue: 0,
      type: "free",
    };

    await Spin.create([
      { ...freeSpin, userId: referrer._id },
      { ...freeSpin, userId }
    ]);

    // Update 1 Free spin to referrer
    referrer.spinCount = (referrer.spinCount || 0) + 1;
    await referrer.save();
    // Give 1 free spin to the referred
    const referredUser = await User.findById(userId);
    if (referredUser) {
      referredUser.spinCount = (referredUser.spinCount || 0) + 1;
      await referredUser.save();
    }

    // Level 2: Get the referrer of level 1 referrer
    const level2Referral = await Referral.findOne({
      referredId: referrer._id,
      level: 1
    });

    if (level2Referral) {
      await Referral.create({
        referrerId: level2Referral.referredBy,
        referredId: userId,
        level: 2,
        commissionPercent: 5
      });

      // Level 3: Get the referrer of level 2 referrer
      const level3Referral = await Referral.findOne({
        referredId: level2Referral.referredBy,
        level: 1
      });

      if (level3Referral) {
        await Referral.create({
          referrerId: level3Referral.referredBy,
          referredId: userId,
          level: 3,
          commissionPercent: 2.5
        });
      }
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
    const referralTree=await Referral.find({referrerId:userId})
    .populate("referredId","name username email mobile role")
    .exec();
    if(!referralTree || referralTree.length === 0){
      res.status(200).json({ success: true, message: "Not Referred Yet" });
    }
    res.status(200).json({ success: true, message: "Referral tree fetched",referralTree });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


export const getReferralCommissions = async (req, res) => {
  try {
    const userId = req.userId;
    const wallet = await Wallet.findOne({ userId: userId });
    if (!wallet) {
      return res.status(404).json({ success: false, message: "Wallet not found" });
    }

    res.status(200).json({ success: true, message: "Commissions fetched", commissions: wallet.commission });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};