import { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { env } from "../config/env";
import { AppError } from "../utils/AppError";
import { MESSAGES } from "../utils/messages";

export const errorMiddleware = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.errors ? { errors: err.errors } : {}),
    });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: MESSAGES.VALIDATION_FAILED,
      errors: err.flatten().fieldErrors,
    });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "A record with this value already exists",
      });
    }

    if (err.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: MESSAGES.NOT_FOUND,
      });
    }
  }

  if (env.NODE_ENV !== "production") {
    console.error(err);
  }

  return res.status(500).json({
    success: false,
    message: MESSAGES.INTERNAL_ERROR,
  });
};
