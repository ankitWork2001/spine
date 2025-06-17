import RewardWallet from "../models/rewardWalletModel.js";

export const getRewardWallet = async (req, res) => {
  try {
    const userId = req.userId;

    const wallet = await RewardWallet.findOne({ userId });

    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found." });
    }

    res.status(200).json({
      success: true,
      wallet,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
