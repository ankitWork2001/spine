import RewardWallet from "../models/rewardWalletModel.js";
import Wallet from "../models/walletModel.js";

// 🆕 Get reward wallet transactions
export const getRewardWalletTransactions = async (req, res) => {
  try {
    const rewardWallet = await RewardWallet.findOne({ userId: req.userId });
    if (!rewardWallet) return res.status(404).json({ message: "Reward wallet not found" });

    res.status(200).json({ transactions: rewardWallet.transactions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🆕 Withdraw from wallet
export const withdrawFromWallet = async (req, res) => {
  try {
    const { amount, from } = req.body; // from: "main" or "reward"
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
