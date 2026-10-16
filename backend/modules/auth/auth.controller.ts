import type { Request, Response } from "express";
import { authService } from "./auth.service.ts";
import { UnauthorizedError } from "../../shared/errors.ts";

// Controllers stay thin: translate HTTP <-> service calls. Validation has
// already run (validate middleware), so req.body is trusted and typed.
export const authController = {
  async register(req: Request, res: Response) {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  },

  async login(req: Request, res: Response) {
    const result = await authService.login(req.body);
    res.status(200).json(result);
  },

  async me(req: Request, res: Response) {
    if (!req.user) throw new UnauthorizedError();
    const user = await authService.getProfile(req.user.id);
    res.status(200).json({ user });
  },

  async changePassword(req: Request, res: Response) {
    if (!req.user) throw new UnauthorizedError();
    await authService.changePassword(req.user.id, req.body);
    res.status(200).json({ message: "Password updated successfully" });
  },
};
