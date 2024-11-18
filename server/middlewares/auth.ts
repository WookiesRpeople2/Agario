import { z } from "zod";
import {
  emailValidator,
  passwordValidator,
  providerDataValidator,
  stringValidator,
} from "../lib/validators";
import type { NextFunction, Request, Response } from "express";

const localValidation = z.object({
  username: stringValidator,
  email: emailValidator,
  password: passwordValidator,
});

const oAuthValidation = z.object({
  providerId: stringValidator,
  providerName: stringValidator,
  providerData: providerDataValidator,
});

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const isOAuth = req.body.providerId && req.body.providerName;

    if (isOAuth) {
      await oAuthValidation.parseAsync(req.body);
    } else {
      await localValidation.parseAsync(req.body);
    }

    req.authType = isOAuth ? "oauth" : "local";
    next();
  } catch (error) {
    const { errors } = error as z.ZodError;
    const errorMessages = errors.map((issue) => issue.message);
    res.status(400).json({ error: errorMessages });
  }
};
