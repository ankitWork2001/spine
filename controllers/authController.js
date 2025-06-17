import User from "../models/userModel.js";
import Wallet from "../models/walletModel.js";
import RewardWallet from "../models/rewardWalletModel.js";
import Referral from "../models/referralModel.js";
import jwt from "jsonwebtoken";

// 🔐 JWT Helper
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// 🧾 Signup
export const signup = async (req, res) => {
  try {
    const { name, email, password, referralCode } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit referral code
    const newUser = await User.create({ name, email, password, code });

    await Wallet.create({ userId: newUser._id });
    await RewardWallet.create({ userId: newUser._id });

    if (referralCode) {
      const referrer = await User.findOne({ code: referralCode });
      if (referrer) {
        await Referral.create({
          referredBy: referrer._id,
          referredUser: newUser._id,
          commissionPercent: 10,
          isCommissionGiven: false,
        });
      }
    }

    res.status(201).json({
      success: true,
      message: "Signup successful",
      token: generateToken(newUser._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔐 Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.status(200).json({
      success: true,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    const wallet = await Wallet.findOne({ userId: user._id });

    res.status(200).json({ user, wallet });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

