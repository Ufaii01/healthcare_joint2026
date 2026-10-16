import { ordersRepository, type OrderWithUnits } from "./orders.repository.ts";
import { membersRepository } from "../members/members.repository.ts";
import { ConflictError, NotFoundError } from "../../shared/errors.ts";
import type { CreateOrderBody } from "./orders.schema.ts";

type TestKey = "glucose" | "anemia" | "cholesterol" | "kidney" | "urine";

// The Order shape the frontend works with (same as src/screens2.tsx Order).
export type OrderDto = {
  id: string;
  v: number;
  createdAt: string;
  cart: TestKey[];
  qty: Partial<Record<TestKey, number>>;
  assign: Partial<Record<TestKey, string[]>>;
  names: Record<string, string>;
  labId: string;
  date: string;
  slot: string;
  address: string;
  notes: string;
  pay: string;
  total: number;
  step: number;
  courier: { name: string; role: string; plate: string; phone: string };
};

// Rebuild the frontend Order shape from the normalized DB rows.
function toDto(order: OrderWithUnits): OrderDto {
  const cart: TestKey[] = [];
  const qty: Partial<Record<TestKey, number>> = {};
  const assign: Partial<Record<TestKey, string[]>> = {};

  // units arrive ordered by (testKey, unitIndex)
  for (const u of order.units) {
    const key = u.testKey as TestKey;
    if (!qty[key]) {
      qty[key] = 0;
      cart.push(key);
      assign[key] = [];
    }
    qty[key] = (qty[key] ?? 0) + 1;
    assign[key]![u.unitIndex] = u.ownerId;
  }

  return {
    id: order.id,
    v: order.version,
    createdAt: order.createdAt.toISOString(),
    cart,
    qty,
    assign,
    names: {},
    labId: order.labId,
    date: order.date,
    slot: order.slot,
    address: order.address,
    notes: order.notes,
    pay: order.pay,
    total: order.total,
    step: order.step,
    courier: {
      name: order.courierName,
      role: order.courierRole,
      plate: order.courierPlate,
      phone: order.courierPhone,
    },
  };
}

export const ordersService = {
  async list(userId: string): Promise<OrderDto[]> {
    const orders = await ordersRepository.listByUser(userId);
    return orders.map(toDto);
  },

  async create(userId: string, input: CreateOrderBody): Promise<OrderDto> {
    const existing = await ordersRepository.findByIdForUser(input.id, userId);
    if (existing) {
      throw new ConflictError("An order with this id already exists");
    }

    // Valid owner ids: "main" + this user's member ids. Only real members
    // get a memberId foreign key; "main" (and anything stale) stays null.
    const members = await membersRepository.listByUser(userId);
    const memberIds = new Set(members.map((m) => m.id));

    const units = input.cart.flatMap((key) => {
      const count = input.qty?.[key] ?? 1;
      return Array.from({ length: count }, (_, i) => {
        const ownerId = input.assign?.[key]?.[i] ?? "main";
        const memberId = memberIds.has(ownerId) ? ownerId : null;
        return { testKey: key, unitIndex: i, ownerId, memberId };
      });
    });

    const order = await ordersRepository.create({
      id: input.id,
      version: input.version ?? 2,
      labId: input.labId,
      date: input.date,
      slot: input.slot,
      address: input.address,
      notes: input.notes ?? "",
      pay: input.pay,
      total: input.total,
      step: input.step ?? 0,
      courierName: input.courier.name,
      courierRole: input.courier.role,
      courierPlate: input.courier.plate,
      courierPhone: input.courier.phone,
      user: { connect: { id: userId } },
      units: {
        create: units.map((u) => ({
          testKey: u.testKey,
          unitIndex: u.unitIndex,
          ownerId: u.ownerId,
          ...(u.memberId ? { member: { connect: { id: u.memberId } } } : {}),
        })),
      },
    });

    return toDto(order);
  },

  async advanceStep(userId: string, orderId: string, step: number): Promise<OrderDto> {
    const order = await ordersRepository.findByIdForUser(orderId, userId);
    if (!order) {
      throw new NotFoundError("Order not found");
    }
    const updated = await ordersRepository.updateStep(orderId, step);
    return toDto(updated);
  },
};
