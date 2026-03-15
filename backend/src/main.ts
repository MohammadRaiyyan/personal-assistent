import { toNodeHandler } from 'better-auth/node';
import cors from 'cors';
import express from 'express';
import { auth } from './lib/auth.ts';
import { coverLetterRoutes } from './modules/cover-letter/routes.ts';
import { insightRoutes } from './modules/insights/routes.ts';
import { interviewRoutes } from './modules/interview/routes.ts';
import { resumeRoutes } from './modules/resume/routes.ts';
import { userRoutes } from './modules/user/routes.ts';

const app = express();

app.use(
    cors({
        origin: process.env.FRONTEND_URL ?? "http://localhost:3000",
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
        credentials: true,
    })
);


app.get("/api/health", (_req, res) => { res.json({ status: "ok" }) });

app.all("/api/auth/*splat", toNodeHandler(auth));

app.use(express.json());
app.use("/api/user", userRoutes)
app.use("/api/resume", resumeRoutes)
app.use("/api/cover-letter", coverLetterRoutes)
app.use("/api/interview", interviewRoutes)
app.use("/api/insight", insightRoutes)

export { app };

export default app;

