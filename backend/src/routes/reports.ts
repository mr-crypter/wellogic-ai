import { Router } from "express";
import { getDailyReport, getWeeklyReport } from "../controllers/reportsController.js";

const router = Router();

router.get("/daily", getDailyReport);
router.get("/weekly", getWeeklyReport);

export default router;


