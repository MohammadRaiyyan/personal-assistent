import express from "express";
import { authenticationMiddleware } from "../../middlewares/authenticate.ts";
import { getUserProfile } from "./controllers.ts";

const userRoutes = express.Router();

userRoutes.use(authenticationMiddleware)
userRoutes.get("/profile", getUserProfile);

export { userRoutes };
