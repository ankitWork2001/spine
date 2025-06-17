import Referral from "../models/referralModel.js";

export const getReferralStatus = async (req, res) => {
  try {
    const userId = req.userId;

    const sent = await Referral.find({ referredBy: userId })
      .populate("referredUser", "name email");

    const received = await Referral.findOne({ referredUser: userId })
      .populate("referredBy", "name email")
      .populate("referredUser", "name email"); // <-- this line added

    res.status(200).json({ sent, received });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
