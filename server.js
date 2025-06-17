import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import investmentRoutes from "./routes/investmentRoutes.js";
import referralRoutes from "./routes/referralRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import rewardRoutes from "./routes/rewardRoutes.js";


dotenv.config();
connectDB();

const app = express();
app.use(express.json());

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/invest", investmentRoutes);
app.use("/api/referral", referralRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/reward", rewardRoutes);


app.get("/", (req, res) => res.send("API Running"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
