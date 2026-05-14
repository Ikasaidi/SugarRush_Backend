import { Request, Response, NextFunction } from "express";
import { HttpException } from "../utils/http-exception";

export const errorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("ERROR:", err);

  if (err instanceof HttpException) {

    const status = (err as any).statusCode ?? (err as any).status ?? 500;
    return res.status(status).json({
      success: false,
      message: err.message,
    });
  }

  // Default error response
  res.status(500).json({
    success: false,
    message: err.message || "Internal server error",
  });
};