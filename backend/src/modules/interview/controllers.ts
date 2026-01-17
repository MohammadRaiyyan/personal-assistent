import { eq } from "drizzle-orm";
import type { Response } from "express";
import db from "../../db/index.ts";
import { assessments, userProfiles } from "../../db/schema.ts";
import { type AuthenticatedRequest } from "../../middlewares/authenticate.ts";
import { generateImprovementTips, generateQuiz } from "../../prompts/index.ts";
import type { SaveQuizType } from "./schema.ts";





export async function saveQuizResult(req: AuthenticatedRequest, res: Response) {
    try {
        const { id: userId } = req.user!;

        const { questions, answers, industry, category, score } = req.body as SaveQuizType

        const questionResults = questions.map((q, index) => ({
            question: q.question,
            answer: q.answer,
            userAnswer: answers[index],
            isCorrect: q.answer === answers[index],
            explanation: q.explanation,
        }));

        const wrongAnswers = questionResults.filter((q) => !q.isCorrect);

        let improvementTips = null;
        if (wrongAnswers.length > 0) {
            const wrongQuestions = wrongAnswers
                .map(
                    (q) =>
                        `Question: "${q.question}"\nCorrect Answer: "${q.answer}"\nUser Answer: "${q.userAnswer}"`
                )
                .join("\n\n");

            improvementTips = await generateImprovementTips({
                industry,
                wrongQuestions,
                category,

            })
        }

        const createdAssessments = db.insert(assessments).values({
            userId,
            category,
            questions: questionResults,
            improvementTips,
            score
        });

        res.status(201).json({
            message: "Quiz result saved successfully",
            data: createdAssessments
        })

    } catch (error) {
        res.status(500).json({
            message: "Something went wrong while saving results",
        })
    }
}

export async function getAssessments(req: AuthenticatedRequest, res: Response) {
    try {
        const { id: userId } = req.user!;
        const results = db.query.assessments.findMany({
            where: eq(assessments.userId, userId)
        })

        res.status(200).json({
            message: "",
            data: results
        })

    } catch (err) {
        res.status(500).json({
            message: "Something went wrong while fetching assessments",
        })
    }
}
export async function takeAssessments(req: AuthenticatedRequest, res: Response) {
    try {
        const { id: userId } = req.user!;
        const userDetails = await db.query.userProfiles.findFirst({
            where: eq(userProfiles.userId, userId)
        })
        if (!userDetails) {
            res.status(400).json({
                message: "User not found",
            })
            return;
        }
        const results = await generateQuiz({ industry: userDetails.industry, skills: userDetails.skills, experience: userDetails.experience });

        res.status(200).json({
            message: "",
            data: results
        })

    } catch (err) {
        res.status(500).json({
            message: "Something went wrong while preparing questions",
        })
    }
}