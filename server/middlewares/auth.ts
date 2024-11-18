import { z } from "zod";
import {
  emailValidator,
  passwordValidator,
  providerDataValidator,
  stringValidator,
} from "../lib/validators";
import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { apiConfig } from "../config";
import { Users } from "../models/users";
import type { Socket } from "socket.io";
import { authenticate } from "../helpers/authenticate";

export const localValidation = z.object({
  username: stringValidator,
  email: emailValidator,
  password: passwordValidator,
});

export const oAuthValidation = z.object({
  providerId: stringValidator,
  providerName: stringValidator,
  providerData: providerDataValidator,
});

export const authValidation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log(req.body);
    const isOAuth = req.body.providerId && req.body.providerName;

    if (isOAuth) {
      await oAuthValidation.parseAsync(req.body);
    } else {
      await localValidation.parseAsync(req.body);
    }
    next();
  } catch (error) {
    const { errors } = error as z.ZodError;
    const errorMessages = errors.map((issue) => issue.message);
    res.status(400).json({ error: errorMessages });
  }
};

export const authJwt = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  await authenticate(
    () => req.headers.authorization?.split(" ")[1],
    (user) => {
      req.user = user;
      next();
    },
    (error) => {
      res.status(401).json(error);
    }
  );
};

export const socketAuthMiddleware = async (
  socket: Socket,
  next: (err?: Error) => void
): Promise<void> => {
  await authenticate(
    () =>
      socket.handshake.auth.token ||
      socket.handshake.headers.authorization?.split(" ")[1],
    (user) => {
      socket.user = user;
      next();
    },
    (error) => {
      next(new Error(error));
    }
  );
};
