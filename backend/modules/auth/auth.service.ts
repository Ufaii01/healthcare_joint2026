import bcrypt from "bcryptjs";
import { authRepository } from "./auth.repository.ts";
import { toPublicUser, type AuthResult, type PublicUser } from "./auth.types.ts";
import { signToken } from "../../shared/jwt.ts";
import { BadRequestError, ConflictError, NotFoundError, UnauthorizedError } from "../../shared/errors.ts";

const SALT_ROUNDS = 12;

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
};

export const authService = {
  async register(input: RegisterInput): Promise<AuthResult> {
    const email = input.email.toLowerCase().trim();
    const existing = await authRepository.findByEmail(email);
    if (existing) {
      throw new ConflictError("An account with this email already exists");
    }

    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
    const user = await authRepository.create({
      name: input.name.trim(),
      email,
      passwordHash,
    });

    return { token: issueToken(user.id, user.email), user: toPublicUser(user) };
  },

  async login(input: LoginInput): Promise<AuthResult> {
    const email = input.email.toLowerCase().trim();
    const user = await authRepository.findByEmail(email);

    // Run a comparison even when the user is missing to avoid leaking which
    // emails exist via response timing.
    const hash = user?.passwordHash ?? "$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinva";
    const ok = await bcrypt.compare(input.password, hash);

    if (!user || !user.passwordHash || !ok) {
      throw new UnauthorizedError("Invalid email or password");
    }

    return { token: issueToken(user.id, user.email), user: toPublicUser(user) };
  },

  async getProfile(userId: string): Promise<PublicUser> {
    const user = await authRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    return toPublicUser(user);
  },

  async changePassword(userId: string, input: ChangePasswordInput): Promise<void> {
    const user = await authRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    if (!user.passwordHash) {
      throw new BadRequestError("No password is set for this account");
    }

    const ok = await bcrypt.compare(input.currentPassword, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedError("Current password is incorrect");
    }

    const newHash = await bcrypt.hash(input.newPassword, SALT_ROUNDS);
    await authRepository.updatePassword(userId, newHash);
  },
};

function issueToken(id: string, email: string): string {
  return signToken({ sub: id, email });
}
