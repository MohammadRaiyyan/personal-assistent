import { and, eq } from "drizzle-orm";
import { type Response } from "express";
import db from "../../db/index.ts";
import { coverLetters, resumes, userProfiles } from "../../db/schema.ts";
import { type AuthenticatedRequest } from "../../middlewares/authenticate.ts";
import { generateCoverLetter } from "../../prompts/index.ts";

export async function getCoverLetter(req: AuthenticatedRequest, res: Response) {
    try {
        const { id: userId } = req.user!;
        const coverLetterId = req.params.coverLetterId;
        const coverLetter = await db.query.coverLetters.findFirst({
            where: and(eq(coverLetters.userId, userId), eq(coverLetters.id, coverLetterId))
        })
        res.status(200).json({
            message: "",
            data: coverLetter ?? null
        })
    } catch (error) {
        res.status(500).json({
            message: "Cover letter not found"
        })
    }
}

export async function getCoverLetters(req: AuthenticatedRequest, res: Response) {
    try {
        const { id: userId } = req.user!;
        const letters = await db.query.coverLetters.findMany({
            where: eq(coverLetters.userId, userId)
        });
        res.status(200).json({
            message: "",
            data: letters
        })
    } catch (error) {
        res.status(500).json({
            message: "Something went wrong"
        })
    }
}

export async function deleteCoverLetter(req: AuthenticatedRequest, res: Response) {
    try {
        const { id: userId } = req.user!;
        const coverLetterId = req.params.coverLetterId;
        await db.delete(coverLetters).where(
            and(eq(coverLetters.userId, userId), eq(coverLetters.id, coverLetterId))
        );
        res.status(200).json({
            message: "Cover letter deleted successfully",
        })
    } catch (error) {
        res.status(500).json({
            message: "Something went wrong while deleting cover letter"
        })
    }
}

export async function getGenerateCoverLetter(req: AuthenticatedRequest, res: Response) {
    try {
        const { id: userId } = req.user!;
        const { companyName, positionTitle, jobDescription } = req.body
        const userProfile = await db.query.userProfiles.findFirst({
            where: eq(userProfiles.userId, userId)
        })
        if (!userProfile) {
            return res.status(400).json({
                message: "User not found"
            })
        }
        const { bio, experience, skills, industry } = userProfile;
        const resume = await db.query.resumes.findFirst({ where: eq(resumes.userId, userId) })
        const result = await generateCoverLetter({
            bio, companyName, experience, industry, jobDescription, jobTitle: positionTitle, skills,
            resumeContent: resume?.content,
        });

        const [coverLetter] = await db.insert(coverLetters).values({
            content: result,
            jobDescription,
            companyName,
            positionTitle,
            status: "finalized",
            userId
        }).returning();

        res.status(201).json({
            message: "Cover letter generated successfully",
            data: coverLetter
        })
    } catch (error) {
        res.status(500).json({
            message: "Could not generate cover letter"
        })
    }
}
