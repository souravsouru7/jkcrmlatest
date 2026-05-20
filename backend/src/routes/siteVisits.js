import { Router } from "express";
import { getSiteVisits, createSiteVisit, updateSiteVisit } from "../controllers/siteVisitController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.use(authenticate);

router.get("/", getSiteVisits);
router.post("/", createSiteVisit);
router.patch("/:id", updateSiteVisit);

export default router;
