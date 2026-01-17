import { eq } from "drizzle-orm";
import { type NextFunction, type Response } from "express";
import db from "../../db/index.ts";
import { users } from "../../db/schema.ts";
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

export async function getUserProfile(req: AuthenticatedRequest, res: Response, _nextFn: NextFunction) {
    const { id: userId } = req.user!;

    try {
        const userDetails = await db.query.userProfiles.findFirst({
            where: eq(users.id, userId),
        });

        res.status(200).json({
            message: "",
            data: userDetails
        })
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch user profile"
        })

    }
}