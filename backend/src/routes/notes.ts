import { Router } from "express";
import { postNote, getNotes, getNoteStats, getNoteStreaks, updateNote, deleteNote } from "../controllers/notesController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/", requireAuth, postNote);
router.get("/", requireAuth, getNotes);
router.get("/stats", requireAuth, getNoteStats);
router.get("/streaks", requireAuth, getNoteStreaks);
router.put("/:id", requireAuth, updateNote);
router.delete("/:id", requireAuth, deleteNote);

export default router;


