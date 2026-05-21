import { Router } from "express";
import { getSiteVisits, createSiteVisit, updateSiteVisit, updateScopeSheet } from "../controllers/siteVisitController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.use(authenticate);

router.get("/", getSiteVisits);
router.post("/", createSiteVisit);
router.patch("/:id", updateSiteVisit);
router.put("/:id/scope-sheet", updateScopeSheet);

export default router;
