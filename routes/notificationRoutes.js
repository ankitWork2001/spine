import express from "express"
import { deleteUserNotifications, getUserNotifications } from "../controllers/notificationController.js";
import { authmiddel } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("./notification", authmiddel, getUserNotifications);
router.delete("./deleteAll",  authmiddel, deleteUserNotifications);

export default router;
