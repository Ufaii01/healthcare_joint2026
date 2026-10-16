import type { Member, Prisma } from "../../../src/generated/prisma/client.ts";
import { prisma } from "../../db.ts";

export const membersRepository = {
  listByUser(userId: string): Promise<Member[]> {
    return prisma.member.findMany({ where: { userId }, orderBy: { createdAt: "asc" } });
  },

  findByIdForUser(id: string, userId: string): Promise<Member | null> {
    return prisma.member.findFirst({ where: { id, userId } });
  },

  create(data: Prisma.MemberCreateInput): Promise<Member> {
    return prisma.member.create({ data });
  },

  delete(id: string): Promise<Member> {
    return prisma.member.delete({ where: { id } });
  },
};
