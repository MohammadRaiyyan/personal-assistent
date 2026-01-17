import { and, eq } from "drizzle-orm";
import type { Response } from "express";
import db from "../../db/index.ts";
import { resumes } from "../../db/schema.ts";
import type { AuthenticatedRequest } from "../../middlewares/authenticate.ts";
import { improveResume, type ImproveResumeParams } from "../../prompts/index.ts";

export async function getResume(req: AuthenticatedRequest, res: Response) {
    try {
        const { id: userId } = req.user!;
        const resume = await db.query.resumes.findFirst({
            where: eq(resumes.userId, userId)
        })

        res.status(200).json({
            message: "",
            data: resume
        })
    } catch (error) {
        res.status(500).json({
            message: "Something went wrong while fetching resume"
        })
    }
}

export async function getResumes(req: AuthenticatedRequest, res: Response) {
    try {
        const { id: userId } = req.user!;
        const results = await db.query.resumes.findMany({
            where: eq(resumes.userId, userId)
        })

        res.status(200).json({
            message: "",
            data: results
        })
    } catch (error) {
        res.status(500).json({
            message: "Something went wrong while fetching resumes"
        })
    }
}

export async function createResume(req: AuthenticatedRequest, res: Response) {
    try {
        const { id: userId } = req.user!;
        const { content } = req.body;
        const createdResume = await db.insert(resumes).values({
            content,
            userId
        });
        res.status(200).json({
            message: "Resume saved successfully",
            data: createdResume
        })
    } catch (error) {
        res.status(500).json({
            message: "Something went wrong while creating resume"
        })
    }
}
export async function updateResume(req: AuthenticatedRequest, res: Response) {
    try {
        const { id: userId } = req.user!;
        const { content } = req.body;
        const updatedResume = await db.update(resumes).set({
            content
        }).where(eq(resumes.userId, userId));

        res.status(200).json({
            message: "Resume updated successfully",
            data: updatedResume
        })
    } catch (error) {
        res.status(500).json({
            message: "Something went wrong while updating resume"
        })
    }
}
export async function deleteResume(req: AuthenticatedRequest, res: Response) {
    try {
        const { id: userId } = req.user!;
        const resumeId = req.params.resumeId;
        await db.delete(resumes).where(and(eq(resumes.userId, userId), eq(resumes.id, resumeId)));

        res.status(200).json({
            message: "Resume deleted successfully",
        })
    } catch (error) {
        res.status(500).json({
            message: "Something went wrong while deleting resume"
        })
    }
}

export async function improveContentWithAI(req: AuthenticatedRequest, res: Response) {
    try {
        const params = req.body as ImproveResumeParams
        const improvedContent = await improveResume(params);
        return res.status(200).json({
            message: "Improved content successfully",
            data: improvedContent
        })
    } catch (error) {
        res.status(500).json({
            message: "Something went wrong while improving the content please retry"
        })
    }
}