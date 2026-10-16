import type { Request, Response } from "express";
import { ordersService } from "./orders.service.ts";
import { UnauthorizedError } from "../../shared/errors.ts";

export const ordersController = {
  async list(req: Request, res: Response) {
    if (!req.user) throw new UnauthorizedError();
    const orders = await ordersService.list(req.user.id);
    res.status(200).json({ orders });
  },

  async create(req: Request, res: Response) {
    if (!req.user) throw new UnauthorizedError();
    const order = await ordersService.create(req.user.id, req.body);
    res.status(201).json({ order });
  },

  async advanceStep(req: Request, res: Response) {
    if (!req.user) throw new UnauthorizedError();
    const order = await ordersService.advanceStep(req.user.id, String(req.params.id), req.body.step);
    res.status(200).json({ order });
  },
};
