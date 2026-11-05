import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import Player, { PlayerDocument } from "../models/Player";
import { createError } from "../utils/errorHandler";

// Adicionando a interface extendida do Request
export interface AuthenticatedRequest extends Request {
  player?: PlayerDocument;
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res
      .status(401)
      .json(createError("Unauthorized", "Token não fornecido."));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      _id: string;
    };

    const player = await Player.findById(decoded._id).select("-password");

    if (!player) {
      return res
        .status(401)
        .json(
          createError("InvalidToken", "Token inválido ou inexistente.")
        );
    }

    req.player = player;
    next();
  } catch (error) {
    return res
      .status(401)
      .json(createError("InvalidToken", "Token inválido ou expirado."));
  }
};
