import { Request, Response } from "express";
import { MESSAGES } from "../utils/messages";

export const notFoundMiddleware = (_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: MESSAGES.ROUTE_NOT_FOUND,
  });
};
