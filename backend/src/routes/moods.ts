import { Router } from "express";
import { postMood, getTrends } from "../controllers/moodsController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/", requireAuth, postMood);
router.get("/trends", requireAuth, getTrends);

export default router;


