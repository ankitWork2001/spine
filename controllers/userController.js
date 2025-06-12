import User from "../models/userModel.js";
import Wallet from "../models/walletModel.js";

export const getEmployeeById = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const user = await User.findById(employeeId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    const wallet = await Wallet.findOne({ userId: employeeId });
    if (!wallet) {
      return res.status(404).json({ success: false, message: "Wallet not found" });
    }
    const { password, ...userDetails } = user._doc;
    const { balance, ...walletDetails } = wallet._doc;
    const userWithWallet = {
      ...userDetails,
      wallet: {
        ...walletDetails,
        balance: balance.toFixed(2),
      },
    };
    res.status(200).json({ success: true, message: "User fetched successfully", user: userWithWallet });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const userId = req.userId;
    const updateData = {};
    
    // Only include fields that were actually provided in the request
    if (req.body.name) updateData.name = req.body.name;
    if (req.body.email) updateData.email = req.body.email;
    if (req.body.mobile) updateData.mobile = req.body.mobile;
    
    // Role and status should only be updatable by admin users
    if (req.userRole === "admin") {
      if (req.body.role) updateData.role = req.body.role;
      if (req.body.status) updateData.status = req.body.status;
    }
    
    // Don't run update if no fields were provided
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "No valid update fields provided" 
      });
    }
    
    // Use findByIdAndUpdate with options to return the updated document
    const updatedUser = await User.findByIdAndUpdate(
      userId, 
      updateData,
      { new: true, runValidators: true } // Return updated user and run schema validators
    );
    
    if (!updatedUser) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }
    
    // Don't send password back to client
    const { password, ...userDetails } = updatedUser._doc;
    
    res.status(200).json({ 
      success: true, 
      message: "User updated successfully",
      user: userDetails
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const uploadAvatar = async (req, res) => {
  try {
    // Implementation
    const userId = req.userId;
    const { avatarUrl } = req.body;

    if (!userId || !avatarUrl) {
      return res.status(400).json({ success: false, message: "userId and avatarUrl are required" });
    }
    // Find the user by ID and update the avatarUrl
    const user = await User.findByIdAndUpdate(
      userId,
      { avatarUrl },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "Avatar uploaded successfully",
      user: user,
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};