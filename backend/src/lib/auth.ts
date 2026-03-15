import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { fromNodeHeaders } from "better-auth/node";
import { type Request } from "express";
import db from "../db/index.ts";

const socialProviders: Parameters<typeof betterAuth>[0]['socialProviders'] = {}

if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    socialProviders.github = {
        clientId: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }
}

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    socialProviders.google = {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }
}

const isProd = process.env.NODE_ENV === "production";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        usePlural: true,
    }),
    trustedOrigins: [
        "http://localhost:3000",
        ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL.replace(/\/$/, "")] : []),
    ],
    emailAndPassword: {
        enabled: true,
    },
    socialProviders,
    advanced: {
        // Cross-origin deployments (Vercel + Render) need SameSite=None; Secure
        // so the browser sends the session cookie on cross-origin requests.
        defaultCookieAttributes: isProd
            ? { sameSite: "none", secure: true, httpOnly: true, partitioned: true }
            : {},
    },
});

export const getAuthContext = async (headers: Request["headers"]) => {
    const session = await auth.api.getSession({
        headers: fromNodeHeaders(headers),
    });
    return session;
}