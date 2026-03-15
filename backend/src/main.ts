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

const allowedOrigins = [
    "http://localhost:3000",
    ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL.replace(/\/$/, "")] : []),
];

const corsOptions: cors.CorsOptions = {
    origin: (origin, callback) => {
        // allow requests with no origin (curl, mobile apps, server-to-server)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
};

app.use(cors(corsOptions));

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
