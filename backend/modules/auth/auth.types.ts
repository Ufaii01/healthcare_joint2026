import type { User } from "../../../src/generated/prisma/client.ts";

// User shape returned to clients — never includes passwordHash.
export type PublicUser = Omit<User, "passwordHash">;

export type AuthResult = {
  token: string;
  user: PublicUser;
};

export function toPublicUser(user: User): PublicUser {
  const { passwordHash: _passwordHash, ...rest } = user;
  return rest;
}
