import { eq } from "drizzle-orm";
import { type NextFunction, type Response } from "express";
import type { APIResponse, UserProfile } from '../../../../shared/types/api';
import db from "../../db/index.ts";
import { userProfiles } from "../../db/schema.ts";
import { type AuthenticatedRequest } from "../../middlewares/authenticate.ts";

// export async function updateUser(req: Request, res: Response) {
//     const { userId } = {
//         userId: "test-user-id",
//     }

//     try {
//         // Start a transaction to handle both operations
//         const result = await db.transaction(
//             async (tx) => {
//                 // First check if industry exists
//                 let industryInsight = await tx.query.industryInsights.findFirst({
//                     where: eq(industryInsights.industry, req.body.industry),
//                 });

//                 // If industry doesn't exist, create it with default values
//                 if (!industryInsight) {
//                     const insights = await generateAIInsights(req.body.industry);

//                     industryInsight = await db.insert(industryInsights).values({
//                         industry: req.body.industry,
//                         ...insights,
//                         nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
//                     }).returning();
//                 }
//             }

//                 // Now update the user
//                 const updatedUser = await tx.user.update({
//                 where: {
//                     id: user.id,
//                 },
//                 data: {
//                     industry: data.industry,
//                     experience: data.experience,
//                     bio: data.bio,
//                     skills: data.skills,
//                 },
//             });

//         return { updatedUser, industryInsight };
//     },
//     {
//         timeout: 10000, // default: 5000
//             }
//         );

//     revalidatePath("/dashboard");
//     return result.user;
// } catch (error) {
//     console.error("Error updating user and industry:", error.message);
//     throw new Error("Failed to update profile");
// }
// }

export async function upsertUserProfile(req: AuthenticatedRequest, res: Response, _nextFn: NextFunction) {
    const { id: userId } = req.user!;
    const { industry, experience, bio, skills, country } = req.body;

    try {
        const [profile] = await db.insert(userProfiles)
            .values({ userId, industry, experience, bio, skills, country, onboarded: true })
            .onConflictDoUpdate({
                target: userProfiles.userId,
                set: { industry, experience, bio, skills, country, onboarded: true },
            })
            .returning();

        res.status(200).json({ message: "Profile updated", data: profile } as APIResponse<UserProfile>);
    } catch (error) {
        res.status(500).json({ message: "Failed to update user profile" });
    }
}

export async function getUserProfile(req: AuthenticatedRequest, res: Response, _nextFn: NextFunction) {
    const { id: userId } = req.user!;

    try {
        const userDetails = await db.query.userProfiles.findFirst({
            where: eq(userProfiles.userId, userId),
        });

        res.status(200).json({
            message: "",
            data: userDetails ?? null
        } as APIResponse<UserProfile | null>)
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch user profile"
        })

    }
}