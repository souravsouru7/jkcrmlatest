import { Router } from "express";
import { getLeads, getLeadById, createLead, updateLead, updateQualification, updateStage, deleteLead } from "../controllers/leadController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.use(authenticate);

router.get("/", getLeads);
router.get("/:id", getLeadById);
router.post("/", createLead);
router.patch("/:id", updateLead);
router.patch("/:id/qualification", updateQualification);
router.patch("/:id/stage", updateStage);
router.delete("/:id", deleteLead);

export default router;
