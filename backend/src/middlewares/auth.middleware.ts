import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../lib/jwt";
import { AppError } from "../utils/AppError";
import { MESSAGES } from "../utils/messages";

export type AuthUser = {
  id: string;
  email: string;
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export const authenticate = (req: Request, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    return next(new AppError(401, MESSAGES.UNAUTHORIZED));
  }

  const token = header.slice(7);

  try {
    const payload = verifyToken(token);
    req.user = { id: payload.userId, email: payload.email };
    next();
  } catch {
    next(new AppError(401, MESSAGES.INVALID_TOKEN));
  }
};
