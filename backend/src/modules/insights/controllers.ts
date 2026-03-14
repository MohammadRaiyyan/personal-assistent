import { eq } from "drizzle-orm";
import type { Response } from "express";
import type { APIResponse } from '../../../../shared/types/api';
import db from "../../db/index.ts";
import { industryInsights, userProfiles } from "../../db/schema.ts";
import type { AuthenticatedRequest } from "../../middlewares/authenticate.ts";
import { generateAIInsights } from "../../prompts/index.ts";

export async function getIndustryInsight(req: AuthenticatedRequest, res: Response) {
    try {
        const { id: userId } = req.user!;
        const insight = await db.query.industryInsights.findMany({
            where: eq(industryInsights.userId, userId)
        })
        res.status(200).json({
            message: "",
            data: insight
        } as APIResponse<typeof insight>)
    } catch (error) {
        res.status(500).json({
            message: "Could not able to fetch industry insight"
        })
    }
}

export async function createIndustryInsight(req: AuthenticatedRequest, res: Response) {
    try {
        const { id: userId } = req.user!;
        const profile = await db.query.userProfiles.findFirst({
            where: eq(userProfiles.userId, userId)
        });

        if (!profile) {
            return res.status(400).json({
                message: "User not found"
            });
        }

        const { industry, skills, experience, country } = profile;
        const newInsight = await generateAIInsights({ experience, industry, skills, country });
        const createdInsight = await db.insert(industryInsights).values({
            userId,
            industry: industry,
            ...newInsight,
            nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        }).returning();

        res.status(201).json({
            message: "Insight created successfully",
            data: createdInsight
        } as APIResponse<typeof createdInsight>)
    } catch (error) {
        res.status(500).json({
            message: "Insight generation failed"
        })
    }
}