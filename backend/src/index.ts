import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import notesRouter from "./routes/notes";
import moodsRouter from "./routes/moods";
import reportsRouter from "./routes/reports";
import aiRouter from "./routes/ai";
import authRouter from "./routes/auth";

dotenv.config();

const app = express();
app.use(cors());
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


