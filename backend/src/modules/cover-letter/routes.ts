import express from "express";
import { createCoverLetterSchema } from "../../db/schema.ts";
import { authenticationMiddleware } from "../../middlewares/authenticate.ts";
import { validateBody } from "../../middlewares/validations.ts";
import { deleteCoverLetter, getCoverLetter, getCoverLetters, getGenerateCoverLetter } from "./controllers.ts";

const coverLetterRoutes = express.Router();
coverLetterRoutes.use(authenticationMiddleware)


coverLetterRoutes.get("/", getCoverLetters)
coverLetterRoutes.get("/:coverLetterId", getCoverLetter)
coverLetterRoutes.post("/", validateBody(createCoverLetterSchema), getGenerateCoverLetter)
coverLetterRoutes.delete("/:coverLetterId", deleteCoverLetter)

export { coverLetterRoutes };

