import { Router } from "express";
import { submitLead } from "../controllers/publicController.js";

const router = Router();

// Public — no JWT. Protected by API key + rate limit.
router.post("/lead", submitLead);

export default router;
