import { Response } from "express";

export const success = <T>(
  res: Response,
  data: T,
  message?: string,
  statusCode = 200
) => {
  return res.status(statusCode).json({
    success: true,
    ...(message ? { message } : {}),
    data,
  });
};
