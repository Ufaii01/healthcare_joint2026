import type { Request, Response } from "express";
import { membersService } from "./members.service.ts";
import { UnauthorizedError } from "../../shared/errors.ts";

export const membersController = {
  async list(req: Request, res: Response) {
    if (!req.user) throw new UnauthorizedError();
    const members = await membersService.list(req.user.id);
    res.status(200).json({ members });
  },

  async create(req: Request, res: Response) {
    if (!req.user) throw new UnauthorizedError();
    const member = await membersService.create(req.user.id, req.body);
    res.status(201).json({ member });
  },

  async remove(req: Request, res: Response) {
    if (!req.user) throw new UnauthorizedError();
    await membersService.remove(req.user.id, String(req.params.id));
    res.status(204).send();
  },
};
