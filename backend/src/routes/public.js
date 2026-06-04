import { Router } from "express";
import { submitLead, googleSheetWebhook } from "../controllers/publicController.js";

const router = Router();

// Public — no JWT. Protected by API key + rate limit.
router.post("/lead", submitLead);

// Google Sheet sync — protected by webhook secret
router.post("/google-sheet", googleSheetWebhook);

export default router;
