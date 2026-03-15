import { and, eq } from "drizzle-orm";
import type { Response } from "express";
import db from "../../db/index.ts";
import { resumes, userProfiles } from "../../db/schema.ts";
import type { AuthenticatedRequest } from "../../middlewares/authenticate.ts";
import { improveResume, type ImproveResumeParams } from "../../prompts/index.ts";

export async function getResume(req: AuthenticatedRequest, res: Response) {
    try {
        const { id: userId } = req.user!;
        const resumeId = req.params.resumeId;
        const resume = await db.query.resumes.findFirst({
            where: and(eq(resumes.userId, userId), eq(resumes.id, resumeId))
        })
        res.status(200).json({ message: "", data: resume ?? null })
    } catch {
        res.status(500).json({ message: "Something went wrong while fetching resume" })
    }
}

export async function getResumes(req: AuthenticatedRequest, res: Response) {
    try {
        const { id: userId } = req.user!;
        const results = await db.query.resumes.findMany({
            where: eq(resumes.userId, userId)
        })
        res.status(200).json({ message: "", data: results })
    } catch {
        res.status(500).json({ message: "Something went wrong while fetching resumes" })
    }
}

export async function createResume(req: AuthenticatedRequest, res: Response) {
    try {
        const { id: userId } = req.user!;
        const { content, title } = req.body;
        const [created] = await db.insert(resumes).values({
            content,
            title: title ?? "Untitled Resume",
            userId
        }).returning();
        res.status(200).json({ message: "Resume created successfully", data: created })
    } catch {
        res.status(500).json({ message: "Something went wrong while creating resume" })
    }
}

export async function updateResume(req: AuthenticatedRequest, res: Response) {
    try {
        const { id: userId } = req.user!;
        const resumeId = req.params.resumeId;
        const { content, title } = req.body;
        const updateData: Record<string, unknown> = {}
        if (content !== undefined) updateData.content = content
        if (title !== undefined) updateData.title = title
        const [updated] = await db.update(resumes)
            .set(updateData)
            .where(and(eq(resumes.userId, userId), eq(resumes.id, resumeId)))
            .returning();
        res.status(200).json({ message: "Resume updated successfully", data: updated })
    } catch {
        res.status(500).json({ message: "Something went wrong while updating resume" })
    }
}

export async function duplicateResume(req: AuthenticatedRequest, res: Response) {
    try {
        const { id: userId } = req.user!;
        const resumeId = req.params.resumeId;
        const original = await db.query.resumes.findFirst({
            where: and(eq(resumes.userId, userId), eq(resumes.id, resumeId))
        })
        if (!original) return res.status(404).json({ message: "Resume not found" })
        const [copy] = await db.insert(resumes).values({
            content: original.content,
            title: `${original.title ?? "Resume"} (Copy)`,
            userId
        }).returning();
        res.status(200).json({ message: "Resume duplicated", data: copy })
    } catch {
        res.status(500).json({ message: "Something went wrong while duplicating resume" })
    }
}

export async function deleteResume(req: AuthenticatedRequest, res: Response) {
    try {
        const { id: userId } = req.user!;
        const resumeId = req.params.resumeId;
        await db.delete(resumes).where(and(eq(resumes.userId, userId), eq(resumes.id, resumeId)));
        res.status(200).json({ message: "Resume deleted successfully" })
    } catch {
        res.status(500).json({ message: "Something went wrong while deleting resume" })
    }
}

export async function improveContentWithAI(req: AuthenticatedRequest, res: Response) {
    try {
        const { id: userId } = req.user!;
        const params = req.body as ImproveResumeParams
        const profile = await db.query.userProfiles.findFirst({
            where: eq(userProfiles.userId, userId)
        })
        const improvedContent = await improveResume({
            ...params,
            skills: profile?.skills,
            experience: profile?.experience,
            bio: profile?.bio,
        });
        return res.status(200).json({ message: "Improved content successfully", data: improvedContent })
    } catch {
        res.status(500).json({ message: "Something went wrong while improving the content, please retry" })
    }
}
