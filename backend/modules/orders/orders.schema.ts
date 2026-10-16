import { z } from "zod";

const testKey = z.enum(["glucose", "anemia", "cholesterol", "kidney", "urine"]);

const qtyShape = z
  .object({
    glucose: z.number().int().min(1).max(9),
    anemia: z.number().int().min(1).max(9),
    cholesterol: z.number().int().min(1).max(9),
    kidney: z.number().int().min(1).max(9),
    urine: z.number().int().min(1).max(9),
  })
  .partial();

const assignShape = z
  .object({
    glucose: z.array(z.string()),
    anemia: z.array(z.string()),
    cholesterol: z.array(z.string()),
    kidney: z.array(z.string()),
    urine: z.array(z.string()),
  })
  .partial();

const courierSchema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  plate: z.string().min(1),
  phone: z.string().min(1),
});

// Mirrors the frontend Order object constructed at checkout.
export const createOrderSchema = z.object({
  id: z.string().trim().min(1).max(40),
  createdAt: z.string().min(1),
  cart: z.array(testKey).min(1, "Cart cannot be empty"),
  qty: qtyShape.optional(),
  assign: assignShape.optional(),
  names: z.record(z.string(), z.string()).optional(),
  labId: z.string().min(1),
  date: z.string().min(1),
  slot: z.string().min(1),
  address: z.string().min(1),
  notes: z.string().default(""),
  pay: z.string().min(1),
  total: z.number().int().min(0),
  step: z.number().int().min(0).max(5).default(0),
  version: z.number().int().optional(),
  courier: courierSchema,
});

export const orderIdParamSchema = z.object({
  id: z.string().min(1),
});

export const advanceStepSchema = z.object({
  step: z.number().int().min(0).max(5),
});

export type CreateOrderBody = z.infer<typeof createOrderSchema>;
export type AdvanceStepBody = z.infer<typeof advanceStepSchema>;
