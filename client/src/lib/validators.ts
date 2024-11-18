import { z } from "zod";

export const urlvalidator = z.string().url();

export const stringValidator = z.string();

export const usernameValidator = z.string().min(6);

export const emailValidator = z.string().min(5).email();

export const passwordValidator = z.string().min(6);
