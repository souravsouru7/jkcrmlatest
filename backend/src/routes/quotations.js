import { Router } from "express";
import { getQuotations, createQuotation, updateQuotation } from "../controllers/quotationController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.use(authenticate);

router.get("/", getQuotations);
router.post("/", createQuotation);
router.patch("/:id", updateQuotation);

export default router;
