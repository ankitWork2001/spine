import mongoose from "mongoose";

const rewardWalletSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  balance: { type: Number, default: 0 },
  transactions: [
    {
      type: { type: String, enum: ["credit", "debit"] },
      amount: Number,
      reason: String,
      date: { type: Date, default: Date.now }
    }
  ],
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model("RewardWallet", rewardWalletSchema);
