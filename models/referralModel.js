import mongoose, { Schema } from "mongoose";

const referralSchema = new Schema(
  {
    referredBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    referredUser: { type: Schema.Types.ObjectId, ref: "User", required: true },
    level: { type: Number, min: 1, max: 3, required: true },
    commissionPercent: { type: Number, required: true },
    isCommissionGiven: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

const Referral = mongoose.model("Referral", referralSchema);

export default Referral;
