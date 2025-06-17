import Plan from "../models/planModel.js";

export const addPlan = async (req, res) => {
  try {
    const { name, amount, duration, rewardPercent } = req.body;

    const plan = await Plan.create({ name, amount, duration, rewardPercent });
    res.status(201).json({ success: true, data: plan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllPlans = async (req, res) => {
  try {
    const plans = await Plan.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: plans });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
