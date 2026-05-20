import { Router } from "express";
import { getFollowUps, createFollowUp, completeFollowUp, updateFollowUp } from "../controllers/followUpController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.use(authenticate);

router.get("/", getFollowUps);
router.post("/", createFollowUp);
router.patch("/:id", updateFollowUp);
router.patch("/:id/complete", completeFollowUp);

export default router;
