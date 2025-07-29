// models/UpiVerification.js
import mongoose from "mongoose";

const upiVerificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  upiId: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  otpExpiresAt: {
    type: Date,
    required: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  }
}, {
  timestamps: true,
});

export default mongoose.model("UpiVerification", upiVerificationSchema);
