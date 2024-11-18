import { Request, Response, NextFunction } from "express";
import type { Users } from "../models/users";

declare module "express" {
  interface Request extends Request {
    user?: DocumentType<Users>;
  }
}
