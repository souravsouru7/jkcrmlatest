import { Router } from "express";
import { submitLead, googleSheetWebhook, facebookVerify, facebookWebhook, submitConsultation } from "../controllers/publicController.js";

const router = Router();

// Public — no JWT. Protected by API key + rate limit.
router.post("/lead", submitLead);

// Google Sheet sync — protected by webhook secret
router.post("/google-sheet", googleSheetWebhook);

// Client consultation form (jkcrm.site/consultation) — public, rate limited
router.post("/consultation", submitConsultation);

// Facebook Lead Ads — Meta webhook verification + leadgen events
router.get("/facebook", facebookVerify);
router.post("/facebook", facebookWebhook);

export default router;
