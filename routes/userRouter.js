import express from "express";
import auditToken from "../middlewares/auditToken.js";
import UserControllers from "../controllers/userContlollers.js";

import upload from "../middlewares/upload.js";

const authRouter = express.Router();
const jsonParcer = express.json();

authRouter.post("/register", jsonParcer, UserControllers.registerUser);

authRouter.post("/login", jsonParcer, UserControllers.loginUser);

authRouter.post("/logout", auditToken, UserControllers.logout);

authRouter.get("/current", auditToken, jsonParcer, UserControllers.currentUser);

authRouter.patch("/avatars", upload.single("avatar"), auditToken, UserControllers.usersAvatar);

export default authRouter;
