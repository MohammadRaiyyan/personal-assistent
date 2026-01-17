import { Router } from "express";
import { authenticationMiddleware } from "../../middlewares/authenticate.ts";
import { validateBody } from "../../middlewares/validations.ts";
import { createResume, deleteResume, getResume, getResumes, improveContentWithAI, updateResume } from "./controllers.ts";
import { createResumeSchema, improveResumeContentSchema } from "./schema.ts";

const route = Router();
route.use(authenticationMiddleware)

route.get("/", getResumes);
route.post("/improve-resume", validateBody(improveResumeContentSchema), improveContentWithAI);
route.post("/", validateBody(createResumeSchema), createResume);
route.get("/:resumeId", getResume);
route.patch("/:resumeId", validateBody(createResumeSchema), updateResume);
route.delete("/:resumeId", deleteResume);

export { route as resumeRoutes };

