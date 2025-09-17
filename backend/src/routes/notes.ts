import { Router } from "express";
import { postNote, getNotes } from "../controllers/notesController";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.post("/", requireAuth, postNote);
router.get("/", requireAuth, getNotes);

export default router;


