import express from "express";
import { authenticationMiddleware } from "../../middlewares/authenticate.ts";
import { getUserProfile, upsertUserProfile } from "./controllers.ts";

const userRoutes = express.Router();

userRoutes.use(authenticationMiddleware)
userRoutes.post("/profile", upsertUserProfile);
userRoutes.get("/profile", getUserProfile);

export { userRoutes };
