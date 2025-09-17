import { Router } from "express";
import { postMood, getTrends } from "../controllers/moodsController";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.post("/", requireAuth, postMood);
router.get("/trends", requireAuth, getTrends);

export default router;


