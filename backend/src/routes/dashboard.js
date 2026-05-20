import { Router } from "express";
import { getDashboard, getCrmData } from "../controllers/dashboardController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.use(authenticate);

router.get("/", getDashboard);
router.get("/crm", getCrmData);

export default router;
