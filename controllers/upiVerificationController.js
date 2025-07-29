// controllers/upiVerificationController.js
import UpiVerification from "../models/UpiVerification.js";
import User from "../models/userModel.js";
import crypto from "crypto";
import sendMail from "../utils/sendMail.js";

export const requestUpiVerification = async (req, res) => {
  try {
    const { upiId } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = crypto.randomInt(100000, 1000000).toString();
    const expiry = Date.now() + 5 * 60 * 1000; // 5 minutes

    await UpiVerification.findOneAndUpdate(
      { user: userId },
      { upiId, otp, otpExpiresAt: new Date(expiry), isVerified: false },
      { upsert: true, new: true }
    );

    await sendMail(user.email, "Your OTP for UPI Verification", `Your OTP is: ${otp}`);

    return res.status(200).json({ message: "OTP sent to your email" });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const verifyUpiOtp = async (req, res) => {
  try {
    const { otp } = req.body;
    const userId = req.user._id;

    const record = await UpiVerification.findOne({ user: userId });

    if (!record) return res.status(404).json({ message: "Verification record not found" });
    if (record.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });
    if (record.otpExpiresAt < Date.now()) return res.status(400).json({ message: "OTP expired" });

    record.isVerified = true;
    await record.save();

    return res.status(200).json({ message: "UPI Verified successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

