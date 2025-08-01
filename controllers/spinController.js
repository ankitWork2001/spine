import User from "../models/userModel.js";
import Wallet from "../models/walletModel.js";
import Spin from "../models/spinModel.js";
import RewardWallet from "../models/rewardWalletModel.js";
import Transaction from "../models/transactionModel.js";

const SPIN_PRICE = 1;

export const purchaseSpin = async (req, res) => {
  try {
    const userId = req.userId;
    let { spinCount } = req.body;

    spinCount = Number(spinCount);

    if (!spinCount || spinCount <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Spin count must be at least 1." });
    }

    const totalAmount = spinCount * SPIN_PRICE;

    const userWallet = await Wallet.findOne({ userId });
    if (!userWallet || userWallet.balance < totalAmount) {
      return res
        .status(400)
        .json({ success: false, message: "Insufficient balance." });
    }

    userWallet.balance -= totalAmount;
    await userWallet.save();

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    user.spinCount += spinCount;
    await user.save();

    // ✅ Create transaction
    const transaction = new Transaction({
      userId,
      amount: totalAmount,
      type: "SpinPurchase",
      amount: spinCount,
    });

    await transaction.save();

    res.status(200).json({
      success: true,
      message: `Successfully purchased ${spinCount} spin(s).`,
      updatedSpinCount: user.spinCount,
      remainingBalance: userWallet.balance,
    });
  } catch (error) {
    console.error("❌ Error in purchaseSpin:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};


// play Spin 2nd route
export const playSpin2 = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user || user.spinCount <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "No spins available" });
    }

    let spinValue = 0;
   const randomValues = [0.11, 0.33, 0.50, 0.80];

if (!user.hasClaimedFirstSpin) {
  spinValue = 0.11;
  user.hasClaimedFirstSpin = true;
  user.cycleSpinCounter = 1;
} else {
  if (user.cycleSpinCounter === 3) {
    spinValue = 1;
    user.cycleSpinCounter = 1;
  } else {
    const randomIndex = Math.floor(Math.random() * randomValues.length);
    spinValue = randomValues[randomIndex]; 
    user.cycleSpinCounter += 1;
  }
}

console.log("Spin cycle counter:", user.cycleSpinCounter);
console.log("Spin reward value:", spinValue);

    const spin = await Spin.create({ userId, resultValue: spinValue });

    user.spinCount -= 1;
    user.totalSpinPlayed += 1;
    await user.save();

    // ✅ FIX: update rewardBalance not balance
    const UserReward = await RewardWallet.findOne({ userId });
    if (!UserReward) {
      return res.status(404).json({ success: false, message: "User reward wallet not found" });
    }

    UserReward.balance += spinValue;

    UserReward.transactions.push({
      type: "credit",
      amount: spinValue,
      reason: "Spin reward",
      date: new Date(),
    });
    await UserReward.save();
  

await Transaction.create({
  userId,
  type: "bonus", 
  amount: spinValue,
  status: "completed" 
});
    res.status(200).json({
      success: true,
      message: "Spin played successfully",
      spin,
      UserReward,
      prizes: [
        "$0",
        "$1",
        "IPAD",
        "WATCH",
        "$0.11",
        "$0.66",
        "$0.33",
        "$0.50",
        "$0.80",
        "$40",
      ],
    });
  } catch (error) {
    console.error("Error in playSpin:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};




export const playSpin = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user || user.spinCount <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "No spins available" });
    }



    let spinValue = 0;

    if (!user.hasClaimedFirstSpin) {
      spinValue = 0.11;
      user.hasClaimedFirstSpin = true;
    } else {
      if (user.cycleSpinCounter === 2) {
        spinValue = 1;
        user.cycleSpinCounter = 0;
      } else {
        spinValue = 0;
        user.cycleSpinCounter += 1;
      }
    }

    const spin = await Spin.create({ userId, resultValue: spinValue });

    user.spinCount -= 1;
    user.totalSpinPlayed += 1;
    await user.save();

    // ✅ FIX: update rewardBalance not balance
    const UserReward = await RewardWallet.findOne({ userId });
    if (!UserReward) {
      return res
        .status(404)
        .json({ success: false, message: "User reward wallet not found" });
    }

    UserReward.balance += spinValue;

    UserReward.transactions.push({
      type: "credit",
      amount: spinValue,
      reason: "Spin reward",
      date: new Date(),
    });
    await UserReward.save();

await Transaction.create({
  userId,
  type: "bonus", 
  amount: spinValue,
  status: "completed" 
});
    res.status(200).json({
      success: true,
      message: "Spin played successfully",
      spin,
      UserReward,
      prizes: [
        "$0",
        "$1",
        "IPAD",
        "WATCH",
        "$0.11",
        "$0.66",
        "$0.33",
        "$0.50",
        "$0.80",
        "$40",
      ],
    });
  } catch (error) {
    console.error("Error in playSpin:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};






export const getPrizeList = async (req, res) => {
  try {
    const prizes = [
       "$0",
        "$1",
        "IPAD",
        "WATCH",
        "$0.11",
        "$0.66",
        "$0.33",
        "$0.50",
        "$0.80",
        "$40",
    ];

    res.status(200).json({
      success: true,
      prizes,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getSpinLogs = async (req, res) => {
  try {
    const userId = req.userId;
    const spins = await Spin.find({ userId }).sort({ createdAt: -1 });
    if (spins.length === 0) return res.json({ message: "No spin log found" });
    res.status(200).json({ success: true, spins });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getSpinCount = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (user.spinCount === 0) {
      return res.status(200).json({
        success: true,
        spinCount: 0,
        message: "No spins available",
      });
    }

    res.status(200).json({
      success: true,
      spinCount: user.spinCount,
      message: "Spins available",
    });
  } catch (error) {
    console.error("❌ Error in getSpinCount:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};
