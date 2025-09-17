import { Router } from "express";
import { postAiSummary } from "../controllers/aiController";

const router = Router();

router.post("/summary", postAiSummary);

export default router;


