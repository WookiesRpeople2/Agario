import type { NextFunction, Request, Response } from "express";
import { Types } from "mongoose";

export const isValidMongoId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  if (!Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "Document not found" });
  }
  next();
};
