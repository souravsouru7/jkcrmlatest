import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { getReminders } from "../controllers/reminderController.js";

const router = Router();
router.use(authenticate);
router.get("/", getReminders);

export default router;
