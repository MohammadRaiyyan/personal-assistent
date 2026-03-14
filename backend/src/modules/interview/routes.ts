import express from "express";
import { authenticationMiddleware } from "../../middlewares/authenticate.ts";
import { validateBody } from "../../middlewares/validations.ts";
import { getAssessments, saveQuizResult, takeAssessments } from "./controllers.ts";
import { saveQuizResultSchema, takeAssessmentSchema } from "./schema.ts";

const interviewRoutes = express.Router();
interviewRoutes.use(authenticationMiddleware)

interviewRoutes.get("/assessments", getAssessments)
interviewRoutes.post("/save-results", validateBody(saveQuizResultSchema), saveQuizResult)
interviewRoutes.post("/take-assessments", validateBody(takeAssessmentSchema), takeAssessments)

export {
    interviewRoutes
};
