import type { NextFunction, Request, RequestHandler, Response } from "express";

// Wraps an async route handler so thrown/rejected errors are forwarded to
// Express' error middleware instead of crashing the process.
export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
