import { Router } from "express";
import { postMood, getTrends } from "../controllers/moodsController";

const router = Router();

router.post("/", postMood);
router.get("/trends", getTrends);

export default router;


