import InvestmentPlan from "../models/investmentPlanModel.js";
import User from "../models/userModel.js";
import Wallet from "../models/walletModel.js";
import Referral from "../models/referralModel.js";
import Transaction from "../models/transactionModel.js";
import Spin from "../models/spinModel.js";
import UserInvestment from "../models/userInvestmentModel.js";

export const createInvestmentPlan = async (req, res) => {
    try {
        const { name, roiPercent, minAmount, durationDays, autoPayout } = req.body;

        // Check if the investment plan already exists
        const existingPlan = await InvestmentPlan.findOne({ name });
        if (existingPlan) {
            return res.status(400).json({ success: false, message: "Investment plan already exists" });
        }

        // Create a new investment plan
        const newPlan = await InvestmentPlan.create({
            name,
            roiPercent,
            minAmount,
            durationDays,
            autoPayout: autoPayout || false,
        });

        res.status(201).json({ success: true, message: "Investment plan created successfully", plan: newPlan });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const getAllInvestmentPlans = async (req, res) => {
  try {
    const plans = await InvestmentPlan.find().sort({ createdAt: -1 }); // Sort by latest first
    if(plans.length === 0){
      return res.status(400).json({ success: false, message: "Investment plan not found" });
    }
    res.status(200).json({ success: true, data: plans });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getAllUserInvestments = async (req,res) => {
  try {
    const investments = await UserInvestment.find()
                        .populate('planId', 'name roiPercent' );
    if(investments.length === 0){
      return res.status(400).json({ success: false, message: " No user had Investment plan" });
    }
    res.status(200).json({ success: true, investments });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });   
  }
}

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({role: "user"});
    res.status(200).json({ success: true,count: users.length, users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getUser = async (req,res) => {
  try {
    const {id} = req.params;
    const user = await User.findOne({ _id: id, role: "user" });
    const wallet = await Wallet.findOne({ userId: id });
    if (!user || !wallet) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, user, wallet });
  } catch (error) {
      res.status(500).json({ success: false, error: error.message });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalReferrals = await Referral.countDocuments();

    let totalDeposits = 0;
    let totalWithdrawals = 0;

    const transactions = await Transaction.find();

    transactions.forEach(transaction => {
      if (transaction.type === "deposit") {
        totalDeposits += transaction.amount;
      } else if (transaction.type === "withdrawal") {
        totalWithdrawals += transaction.amount;
      }
    });


    
    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalReferrals,
        totalDeposits,
        totalWithdrawals,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Ban or activate user
export const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    user.status = status;
    await user.save();
    res.status(200).json({ success: true, message: "User status updated successfully" , user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// View all Deposits;
export const getAllDeposits = async (req, res) => {
  try {
    const transactions = await Transaction.find({type:"deposit"})
    .populate("userId", "name username email role status")
    .exec();
    if(!transactions){
      return res.status(404).json({ success: false, message: "Transaction not found" });   
    }
    res.status(200).json({ success: true, transactions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// View All withdrawals
export const getAllWithdrawals = async (req,res) => {
  try {
    const transactions = await Transaction.find({type:"withdrawal"})
    .populate("userId", "name username email role status")
    .exec();
    if(!transactions){
      return res.status(404).json({ success: false, message: "Transaction not found" });   
    }
    res.status(200).json({ success: true, transactions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Toggle Deposit status to Completed or Failed
export const toggleDepositStatus = async (req,res) => {
  try {
    const {id} = req.params;
    const {status} = req.body;
    const trans = await Transaction.findById(id);

    if(!trans){
      return res.status(404).json({ success: false, message: "Transaction not found" });   
    }

    // Ensure it's a deposit and still pending
    if(trans.type !== 'deposit' || trans.status !== 'pending'){
      return res.status(404).json({ success: false, message: "Transaction type is not deposit or the status is not pending" });   
    }

    trans.status = status;
    await trans.save();

    res.status(200).json({
      success: true,
      message: "Deposit status updated successfully",
      transaction: trans,
    });

  } catch (error) {
     res.status(500).json({ success: false, error: error.message });   
  }
};

// Approve all withdrawals
export const approvewithdrawals = async (req,res) => {
  try {
    const transactions = await Transaction.find({ type: 'withdrawal', status: 'pending' });
    if(!transactions || transactions.length === 0){
      return res.status(404).json({ success: false, message: "Transactions not found " });   
    }
    
    await Promise.all(
      transactions.map(async (t) => {
        t.status = 'completed';
        await t.save();
      })
    );

    res.status(200).json({
      success: true,
      message: "Transactions approved",
      transactions,
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });       
  }
};

//Toggle Withdrawals status to Completed or Failed
export const toggleWithdrawalStatus = async (req,res) => {
  try {
    const {id} = req.params;
    const {status} = req.body;
    const trans = await Transaction.findById(id);

    if(!trans || trans.amount <= 100){
      return res.status(404).json({ success: false, message: "Transaction not found or Amount is less than 100" });   
    }

    // Ensure it's a withdrawal and still pending
    if(trans.type !== 'withdrawal' || trans.status !== 'pending'){
      return res.status(404).json({ success: false, message: "Transaction type is not withdrawal or the status is not pending" });   
    }

    trans.status = status;
    await trans.save();

    res.status(200).json({
      success: true,
      message: "Withdrawal status updated successfully",
      transaction: trans,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message }); 
  }
};

//View All Transactions and reports
export const getAllTransactionReports = async (req,res) => {
  try {
    const transactions = await Transaction.find().sort({
      createdAt: -1
    });
    if(!transactions){
      return res.status(404).json({ success: false, message: "Transactions not there yet" });   
    }

    res.status(200).json({
      success: true,
      message: "Transactions fetched",
      transactions,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });     
  }
}

// update investment plan
export const updateInvestmentPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      roiPercent,
      minAmount,
      durationDays,
      autoPayout
    } = req.body;

    // Find the plan by ID
    const plan = await InvestmentPlan.findById(id);
    if (!plan) {
      return res.status(404).json({ success: false, message: "Investment plan not found" });
    }

    // Update fields if provided
    if (name !== undefined) plan.name = name;
    if (roiPercent !== undefined) plan.roiPercent = roiPercent;
    if (minAmount !== undefined) plan.minAmount = minAmount;
    if (durationDays !== undefined) plan.durationDays = durationDays;
    if (autoPayout !== undefined) plan.autoPayout = autoPayout;

    await plan.save();

    res.status(200).json({
      success: true,
      message: "Investment plan updated successfully",
      data: plan
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// View all spins
export const getSpinLogs = async (req, res) => {
  try {
    const spins = await Spin.find()
    .populate("userId", "name username email role status")
    .exec();
    if (!spins || spins.length === 0) {
      return res.status(404).json({ success: false, message: "No spins found" });
    }

    res.status(200).json({ success: true, spins });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Referral system stats
export const getReferralStats = async (req, res) => {
  try {
    const referrals = await Referral.find()
      .populate("referredBy", "name email")
      .populate("referredUser", "name email")
      .exec();
    res.status(200).json({ success: true, referrals });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};