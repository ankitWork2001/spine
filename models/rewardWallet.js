import mongoose, { Schema } from "mongoose";

const rewardWalletSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  rewardBalance: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true
});

const RewardWallet = mongoose.model("RewardWallet", rewardWalletSchema);

export default RewardWallet;
