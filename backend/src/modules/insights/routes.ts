import express from "express";
import { authenticationMiddleware } from "../../middlewares/authenticate.ts";
import { createIndustryInsight, getIndustryInsight } from "./controllers.ts";

const insightRoutes = express.Router();

insightRoutes.use(authenticationMiddleware)

insightRoutes.get("/industry-insights", getIndustryInsight);
insightRoutes.post("/industry-insights", createIndustryInsight);


export { insightRoutes };

