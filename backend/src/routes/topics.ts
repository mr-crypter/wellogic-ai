import { Router } from "express";
import { getTopics } from "../controllers/topicsController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, getTopics);

export default router;


