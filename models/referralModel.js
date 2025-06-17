import mongoose from 'mongoose';

const referralSchema = new mongoose.Schema({
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  referredUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isRewardGiven: { type: Boolean, default: false },
  amount: { type: Number, default: 0 },
});

export default mongoose.model('Referral', referralSchema);
