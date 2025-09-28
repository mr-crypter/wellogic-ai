import { Router } from "express";
import { postAiSummary, postAiSuggestions } from "../controllers/aiController.js";

const router = Router();

router.post("/summary", postAiSummary);
router.post("/suggestions", postAiSuggestions);

export default router;


