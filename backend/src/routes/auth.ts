import { Router } from "express";
import { login, signup, me } from "../controllers/authController.js";

const router = Router();

router.post("/login", login);
router.post("/signup", signup);
router.get("/me", me);

export default router;


