import User from "../models/userModel.js";
import Wallet from "../models/walletModel.js";
import RewardWallet from "../models/rewardWalletModel.js";
import ReferralTransaction from "../models/referralTransactionModel.js";
import Transaction from "../models/transactionModel.js";

// 🟢 Get Reward Wallet Transactions
export const getRewardWalletTransactions = async (req, res) => {
  try {
    const rewardWallet = await RewardWallet.findOne({ userId: req.userId });
    if (!rewardWallet) {
      return res.status(404).json({ message: "Reward wallet not found" });
    }

    res.status(200).json({
      success: true,
      transactions: rewardWallet.transactions,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🟢 Withdraw from Wallet
export const withdrawFromWallet = async (req, res) => {
  try {
    const { amount, from } = req.body;
    const userId = req.userId;

    if (!["main", "reward"].includes(from)) {
      return res.status(400).json({ message: "Invalid wallet type" });
    }

    if (from === "main") {
      const wallet = await Wallet.findOne({ userId });
      if (!wallet || wallet.balance < amount) {
        return res.status(400).json({ message: "Insufficient main wallet balance" });
      }
      wallet.balance -= amount;
      await wallet.save();
    } else {
      const rewardWallet = await RewardWallet.findOne({ userId });
      if (!rewardWallet || rewardWallet.balance < amount) {
        return res.status(400).json({ message: "Insufficient reward wallet balance" });
      }
      rewardWallet.balance -= amount;
      rewardWallet.transactions.push({
        type: "debit",
        amount,
        reason: "User withdrawal",
      });
      await rewardWallet.save();
    }

    res.status(200).json({ message: "Withdrawal successful" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🟢 Get Employee by ID
export const getEmployeeById = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const user = await User.findById(employeeId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const wallet = await Wallet.findOne({ userId: employeeId });
    if (!wallet) return res.status(404).json({ success: false, message: "Wallet not found" });

    const { password, ...userDetails } = user._doc;
    const { balance, ...walletDetails } = wallet._doc;

    const userWithWallet = {
      ...userDetails,
      wallet: {
        ...walletDetails,
        balance: balance.toFixed(2),
      },
    };

    res.status(200).json({
      success: true,
      message: "User fetched successfully",
      user: userWithWallet,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 🟢 Update User
export const updateUser = async (req, res) => {
  try {
    const userId = req.userId;
    const updateData = {};

    if (req.body.name) updateData.name = req.body.name;
    if (req.body.email) updateData.email = req.body.email;
    if (req.body.mobile) updateData.mobile = req.body.mobile;

    if (req.userRole === "admin") {
      if (req.body.role) updateData.role = req.body.role;
      if (req.body.status) updateData.status = req.body.status;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ success: false, message: "No valid update fields provided" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const { password, ...userDetails } = updatedUser._doc;

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: userDetails,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 🟢 Upload Avatar
export const uploadAvatar = async (req, res) => {
  try {
    const userId = req.userId;
    const { avatarUrl } = req.body;

    if (!userId || !avatarUrl) {
      return res.status(400).json({ success: false, message: "userId and avatarUrl are required" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { avatarUrl },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "Avatar uploaded successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 🟢 Get Reward History
export const getRewardHistory = async (req, res) => {
  try {
    const userId = req.userId;

    const transactions = await ReferralTransaction.find({ referrerId: userId })
      .populate("referredUserId", "name email")
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      message: "Reward history fetched",
      data: transactions,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

//User summary dashboard todays earning , balanced & frozen amount 

export const getUserDashboardSummary = async (req, res) => {
  try {
    const userId = req.userId;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Fetch Wallet
    const wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      return res.status(404).json({ success: false, message: "Wallet not found" });
    }

    // Today's Spin Earnings (type: "bonus")
    const spinEarnings = await Transaction.aggregate([
      {
        $match: {
          userId,
          type: "bonus",
          createdAt: { $gte: todayStart, $lte: todayEnd }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" }
        }
      }
    ]);

    // Today's Referral Earnings
    const referralEarnings = await ReferralTransaction.aggregate([
      {
        $match: {
          referrerId: userId,
          date: { $gte: todayStart, $lte: todayEnd }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" }
        }
      }
    ]);

    const todaysEarnings = 
      (spinEarnings[0]?.total || 0) + 
      (referralEarnings[0]?.total || 0);

    res.status(200).json({
      success: true,
      data: {
        todaysEarnings: Number(todaysEarnings.toFixed(2)),
        balance: Number(wallet.balance.toFixed(2)),
        frozenAmount: Number(wallet.lockedBalance.toFixed(2))
      }
    });
  } catch (error) {
    console.error("Error in getUserDashboardSummary:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};