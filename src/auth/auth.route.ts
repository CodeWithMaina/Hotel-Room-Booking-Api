import { Router } from "express";
import {  createUser, loginUser, passwordReset,updatePassword } from "./auth.controller";

export const authRouter = Router();

authRouter.post("/register", createUser);
authRouter.post("/login", loginUser);
authRouter.post("/forgot-password", passwordReset);
authRouter.put("/password-reset/:token", updatePassword);