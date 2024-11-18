import express from "express";
import { authValidation, authJwt } from "../middlewares/auth";
import { signIn, signup, userUpdate } from "../controllers/users";
export const userRouter = express.Router();

userRouter.post("/sign-in", authValidation, signIn);

userRouter.post("/sign-up", authValidation, signup);

userRouter.put("/edit-profile", authJwt, userUpdate);
