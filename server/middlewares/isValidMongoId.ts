import type { NextFunction, Request, Response } from "express";
import { Types } from "mongoose";
import { validId } from "../helpers/validId";
import type { Socket } from "socket.io";

export const isValidMongoId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await validId(
    () => {
      const { id } = req.params;
      if (!Types.ObjectId.isValid(id)) {
        throw new Error("Document not found");
      }
      next();
    },
    (error) => {
      return res.status(404).json({ message: error });
    }
  );
};

export const isValidMongoIdSocket = async (socket: Socket, id: string) => {
  await validId(
    () => {
      if (!Types.ObjectId.isValid(id)) {
        throw new Error("Document not found");
      }
    },
    (error) => {
      socket.emit("Document not found");
    }
  );
};
