// routes/investmentRoutes.js
import express from "express";
import { invest } from "../controllers/investmentController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/invest", authMiddleware, invest);

export default router;
