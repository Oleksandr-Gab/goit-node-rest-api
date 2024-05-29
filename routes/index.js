import express from "express";

import userRouter from "./userRouter.js";
import contactsRouter from "./contactsRouter.js";
import auditToken from "../middlewares/auditToken.js";

const routers = express.Router();

routers.use("/users", userRouter);
routers.use("/contacts", auditToken, contactsRouter);

export default routers;
