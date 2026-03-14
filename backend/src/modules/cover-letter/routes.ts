import express from "express";
import { authenticationMiddleware } from "../../middlewares/authenticate.ts";
import { deleteCoverLetter, getCoverLetter, getCoverLetters, getGenerateCoverLetter } from "./controllers.ts";

const coverLetterRoutes = express.Router();
coverLetterRoutes.use(authenticationMiddleware)

coverLetterRoutes.get("/", getCoverLetters)
coverLetterRoutes.get("/:coverLetterId", getCoverLetter)
coverLetterRoutes.post("/", getGenerateCoverLetter)
coverLetterRoutes.delete("/:coverLetterId", deleteCoverLetter)

export { coverLetterRoutes };

