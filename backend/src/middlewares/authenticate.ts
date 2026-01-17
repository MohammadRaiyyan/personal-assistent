import { fromNodeHeaders } from "better-auth/node";
import type { NextFunction, Request, Response } from "express";
import type { User } from "../db/schema.ts";
import { auth } from "../lib/auth.ts";

export interface AuthenticatedRequest extends Request {
    user?: User
}
export async function authenticationMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const session = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers),
    });
    if (!session || !session.user) {
        {
            return res.status(401).json({ error: "Unauthorized" });
        }
    }
    req.user = session.user
    next();
}