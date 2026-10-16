import type { Order, OrderUnit, Prisma } from "../../../src/generated/prisma/client.ts";
import { prisma } from "../../db.ts";

export type OrderWithUnits = Order & { units: OrderUnit[] };

export const ordersRepository = {
  listByUser(userId: string): Promise<OrderWithUnits[]> {
    return prisma.order.findMany({
      where: { userId },
      include: { units: { orderBy: [{ testKey: "asc" }, { unitIndex: "asc" }] } },
      orderBy: { createdAt: "desc" },
    });
  },

  findByIdForUser(id: string, userId: string): Promise<OrderWithUnits | null> {
    return prisma.order.findFirst({
      where: { id, userId },
      include: { units: { orderBy: [{ testKey: "asc" }, { unitIndex: "asc" }] } },
    });
  },

  create(data: Prisma.OrderCreateInput): Promise<OrderWithUnits> {
    return prisma.order.create({ data, include: { units: true } });
  },

  updateStep(id: string, step: number): Promise<OrderWithUnits> {
    return prisma.order.update({ where: { id }, data: { step }, include: { units: true } });
  },
};
