import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import { env } from "../config/env.ts";
import { UnauthorizedError } from "./errors.ts";

export type JwtPayload = {
  sub: string; // user id
  email: string;
};

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
  });
}

export function verifyToken(token: string): JwtPayload {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    if (typeof decoded === "string" || !decoded.sub || !("email" in decoded)) {
      throw new UnauthorizedError("Invalid token");
    }
    return { sub: String(decoded.sub), email: String(decoded.email) };
  } catch {
    throw new UnauthorizedError("Invalid or expired token");
  }
}
