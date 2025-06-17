import mongoose, { Schema } from "mongoose";

const planSchema = new Schema({
  name: { type: String, required: true },
  amount: { type: Number, required: true },
  duration: { type: Number, required: true }, // in days/months
  rewardPercent: { type: Number, required: true } // e.g., 10%
}, { timestamps: true });

const Plan = mongoose.model("Plan", planSchema);
export default Plan;
