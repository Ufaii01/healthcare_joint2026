import type { NextFunction, Request, Response } from "express";
import { verifyToken } from "../shared/jwt.ts";
import { UnauthorizedError } from "../shared/errors.ts";

// Augment Express' Request with the authenticated user context.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: { id: string; email: string };
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    throw new UnauthorizedError("Missing or malformed Authorization header");
  }

  const token = header.slice("Bearer ".length).trim();
  const payload = verifyToken(token);
  req.user = { id: payload.sub, email: payload.email };
  next();
}
