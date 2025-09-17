import { Router } from "express";
import { postNote, getNotes } from "../controllers/notesController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/", requireAuth, postNote);
router.get("/", requireAuth, getNotes);

export default router;


