import { request } from "./client";
import type { Order } from "../screens2";

export const ordersApi = {
  async list(): Promise<Order[]> {
    const { orders } = await request<{ orders: Order[] }>("/api/orders", { method: "GET" });
    return orders;
  },

  async create(order: Order): Promise<Order> {
    const { order: created } = await request<{ order: Order }>("/api/orders", {
      method: "POST",
      body: JSON.stringify(order),
    });
    return created;
  },

  async advanceStep(id: string, step: number): Promise<Order> {
    const { order } = await request<{ order: Order }>(`/api/orders/${encodeURIComponent(id)}/step`, {
      method: "PATCH",
      body: JSON.stringify({ step }),
    });
    return order;
  },
};
