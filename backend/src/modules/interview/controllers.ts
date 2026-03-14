import { eq } from "drizzle-orm";
import type { Response } from "express";
import db from "../../db/index.ts";
import { assessments, userProfiles } from "../../db/schema.ts";
import { type AuthenticatedRequest } from "../../middlewares/authenticate.ts";
import { generateImprovementTips, generateQuiz } from "../../prompts/index.ts";
import type { SaveQuizType, TakeAssessmentType } from "./schema.ts";

export async function saveQuizResult(req: AuthenticatedRequest, res: Response) {
    try {
        const { id: userId } = req.user!;

        const { questions, answers, industry, category, difficulty, score } = req.body as SaveQuizType

        const questionResults = questions.map((q, index) => ({
            question: q.question,
            answer: q.answer,
            userAnswer: answers[index] ?? "",
            isCorrect: q.answer === answers[index],
            explanation: q.explanation ?? "",
        }));

        const wrongAnswers = questionResults.filter((q) => !q.isCorrect);

        const wrongQuestions = wrongAnswers.length > 0
            ? wrongAnswers
                .map((q) => `Question: "${q.question}"\nCorrect Answer: "${q.answer}"\nUser Answer: "${q.userAnswer}"`)
                .join("\n\n")
            : undefined;

        const tip = await generateImprovementTips({
            industry,
            category,
            difficulty,
            score,
            wrongQuestions,
        });
        const improvementTips = [tip];

        const [createdAssessment] = await db.insert(assessments).values({
            userId,
            category,
            questions: questionResults,
            improvementTips,
            score
        }).returning();

        res.status(201).json({
            message: "Quiz result saved successfully",
            data: createdAssessment
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
        const results = await db.query.assessments.findMany({
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
        const { category, difficulty, count } = req.body as TakeAssessmentType;

        const userDetails = await db.query.userProfiles.findFirst({
            where: eq(userProfiles.userId, userId)
        })
        if (!userDetails) {
            res.status(400).json({ message: "User not found" })
            return;
        }
        const results = await generateQuiz({
            industry: userDetails.industry,
            skills: userDetails.skills,
            experience: userDetails.experience,
            category,
            difficulty,
            count,
        });

        res.status(200).json({ message: "", data: results })
    } catch (err) {
        res.status(500).json({ message: "Something went wrong while preparing questions" })
    }
}
