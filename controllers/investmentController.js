import Wallet from "../models/walletModel.js";
import RewardWallet from "../models/rewardWalletModel.js"; // ✅ Add this import
import Referral from "../models/referralModel.js";

export const invest = async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.userId;

    // ✅ Check user has enough balance
    const userWallet = await Wallet.findOne({ userId });
    if (!userWallet || userWallet.balance < amount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // ✅ Deduct amount from user's main wallet
    userWallet.balance -= amount;
    await userWallet.save();

    // ✅ Check referral eligibility
    const referral = await Referral.findOne({
      referredUser: userId,
      isRewardGiven: false,
    });

    if (referral) {
      const reward = amount * 0.1;

      // ✅ Credit reward to referrer's RewardWallet
      const rewardWallet = await RewardWallet.findOne({ userId: referral.referredBy });

      if (rewardWallet) {
        rewardWallet.balance += reward;
        rewardWallet.transactions.push({
          type: "credit",
          amount: reward,
          reason: "Referral reward",
        });
        await rewardWallet.save();
      }

      // ✅ Mark referral as rewarded
      referral.isRewardGiven = true;
      referral.amount = reward;
      await referral.save();
    }

    res.status(200).json({ message: "Investment successful" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
