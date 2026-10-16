import { z } from "zod";

export const createMemberSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(60),
  age: z.string().trim().min(1, "Age is required").max(3),
  gender: z.enum(["Female", "Male", ""]),
});

export const memberIdParamSchema = z.object({
  id: z.string().min(1),
});

export type CreateMemberBody = z.infer<typeof createMemberSchema>;
