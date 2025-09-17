import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import notesRouter from "./routes/notes.js";
import moodsRouter from "./routes/moods.js";
import reportsRouter from "./routes/reports.js";
import aiRouter from "./routes/ai.js";
import authRouter from "./routes/auth.js";

dotenv.config();

const app = express();
app.use(helmet({
	contentSecurityPolicy: false
}));
app.use(cors({
	origin: process.env.CORS_ORIGIN?.split(",") || ["http://localhost:3000"],
	credentials: true,
}));
app.use(express.json());

app.get("/api/v1/health", (req: Request, res: Response) => {
	res.json({ status: "ok" });
});

app.use("/api/v1/notes", notesRouter);
app.use("/api/v1/moods", moodsRouter);
app.use("/api/v1/reports", reportsRouter);
app.use("/api/ai", aiRouter);
app.use("/api/auth", authRouter);

const PORT = Number(process.env.PORT) || 4000;
app.listen(PORT, () => {
	console.log(`Backend listening on http://localhost:${PORT}`);
});


