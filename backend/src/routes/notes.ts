import { Router } from "express";
import { postNote, getNotes } from "../controllers/notesController";

const router = Router();

router.post("/", postNote);
router.get("/", getNotes);

export default router;


