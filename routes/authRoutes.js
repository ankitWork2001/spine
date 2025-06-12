import { Router } from "express";
import { login, signup } from "../controllers/authController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { getUser } from "../controllers/authController.js";
const router = Router();

router.post("/signup",signup);
router.post("/login",login);
router.get('/user', authenticate, getUser);


export default router;
