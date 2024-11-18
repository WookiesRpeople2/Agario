import jwt from "jsonwebtoken";
import { apiConfig } from "../config";
import bcrypt from "bcrypt";
import type { Request, Response } from "express";
import { Users } from "../models/users";
import { localValidation } from "../middlewares/auth";
import { Types } from "mongoose";
import { z } from "zod";
import { Invintory } from "../models/invintory";
import { Skins } from "../models/skins";

const AUTH_CONSTANTS = {
  SALT_ROUNDS: 12,
  TOKEN_EXPIRY: "30 days",
  MIN_PASSWORD_LENGTH: 8,
  MAX_USERNAME_LENGTH: 30,
  DEFAULT_SKIN_NAME: "default",
} as const;

type AuthResponse<T> = {
  token?: string;
  message?: string;
  error?: string;
  data?: T;
};

const createToken = (_id: Types.ObjectId, email: string) => {
  return jwt.sign({ _id, email }, apiConfig.auth.jwtSecret, {
    expiresIn: "30 days",
  });
};

const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(AUTH_CONSTANTS.SALT_ROUNDS);
  return bcrypt.hash(password, salt);
};

const validatePassword = async (
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(plainPassword, hashedPassword);
};

const createAuthResponse = <T>(
  status: number,
  data: AuthResponse<T>,
  res: Response
): Response<any, Record<string, any>> => res.status(status).json(data);

export const signup = async (req: Request, res: Response): Promise<void> => {
  const { username, email, password } = req.body;

  try {
    const exsits = await Users.findOne({ email });
    if (exsits) {
      throw new Error("An error occurred during signup");
    }

    const defaultSkin = await Skins.findOne({
      name: AUTH_CONSTANTS.DEFAULT_SKIN_NAME,
    });
    if (!defaultSkin) {
      throw new Error("An error occurred during signup");
    }

    const hashedPassword = await hashPassword(password);
    const user = await Users.create({
      username,
      email,
      password: hashedPassword,
    });

    await Invintory.create({
      userId: user._id,
      skins: [{ skinId: defaultSkin._id, equipped: true }],
    });

    const token = createToken(user._id, user.email);

    createAuthResponse(200, { token }, res);
  } catch (error) {
    createAuthResponse(
      401,
      {
        message: error as string,
      },
      res
    );
  }
};

export const signIn = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  try {
    const user = await Users.findOne({ email });

    if (!user) {
      throw new Error("Invalid credentials");
    }

    const matches = await validatePassword(password, user.password!);
    if (!matches) {
      throw new Error();
    }

    const token = createToken(user._id, user.email);

    createAuthResponse(200, { token }, res);
  } catch (error) {
    createAuthResponse(
      401,
      {
        message: error as string,
      },
      res
    );
  }
};

export const userUpdate = async (
  req: Request,
  res: Response
): Promise<void> => {
  const id = req.user._id;
  const { username, email, password } = req.body;
  try {
    const updateData: Partial<z.infer<typeof localValidation>> = {};

    if (email) {
      const exsists = await Users.findOne({ email });
      if (exsists) {
        throw new Error("An error occured while updating user");
      }
      updateData.email = email;
    }

    if (password) {
      updateData.password = await hashPassword(password);
    }

    if (username) {
      updateData.username = username;
    }

    const user = await Users.findOneAndUpdate(
      { _id: id },
      { $set: updateData }
    );

    const userEmail = user!.email;
    const token = createToken(user!._id, userEmail);
    createAuthResponse<{ email: string }>(
      200,
      {
        data: { email: userEmail },
        token,
      },
      res
    );
  } catch (error) {
    createAuthResponse(
      401,
      {
        message: error as string,
      },
      res
    );
  }
};
