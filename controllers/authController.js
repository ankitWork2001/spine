import User from "../models/userModel.js";
import Wallet from "../models/walletModel.js";
import RewardWallet from "../models/rewardWalletModel.js";
import Referral from "../models/referralModel.js";
import jwt from "jsonwebtoken";

// 🔐 Token Generator
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// 🧾 SIGNUP
export const signup = async (req, res) => {
  try {
    const { name, username, email, password, mobile, role, referralCode } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    if (role === 'admin') {
      const existingAdmin = await User.findOne({ role: 'admin' });
      if (existingAdmin) {
        return res.status(400).json({ error: 'An admin already exists. Only one admin is allowed.' });
      }
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const newUser = await User.create({
      name,
      username,
      email,
      password,
      mobile,
      role: role || "user",
      code,
    });

    await Wallet.create({ userId: newUser._id });
    await RewardWallet.create({ userId: newUser._id });

    if (referralCode) {
      const referrer = await User.findOne({ code: referralCode });

      if (referrer) {
        try {
          await Referral.create({
            referredBy: referrer._id,
            referredUser: newUser._id,
            commissionPercent: 10,
            isCommissionGiven: false,
          });
        } catch (referralError) {
          console.error("Referral creation error:", referralError);
          return res.status(500).json({
            success: false,
            message: "User created but referral failed",
            error: referralError.message,
          });
        }
      }
    }

    return res.status(201).json({
      success: true,
      message: "Signup successful",
      token: generateToken(newUser._id),
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 🔐 LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    if (user.status !== "active") {
      return res.status(403).json({ success: false, message: "Account is not active" });
    }

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token: generateToken(user._id),
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 👤 GET USER
export const getUser = async (req, res) => {
  try {
    const userId = req.userId;

    const [user, wallet] = await Promise.all([
      User.findOne({ _id: userId, role: "user" }).select("-password -__v"),
      Wallet.findOne({ userId }).select("-__v"),
    ]);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (!wallet) {
      return res.status(404).json({ success: false, message: "Wallet not found" });
    }

    return res.status(200).json({
      success: true,
      data: { user, wallet },
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
