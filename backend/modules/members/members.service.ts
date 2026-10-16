import type { Member } from "../../../src/generated/prisma/client.ts";
import { membersRepository } from "./members.repository.ts";
import { NotFoundError } from "../../shared/errors.ts";

export type CreateMemberInput = {
  name: string;
  age: string;
  gender: "Female" | "Male" | "";
};

export const membersService = {
  list(userId: string): Promise<Member[]> {
    return membersRepository.listByUser(userId);
  },

  create(userId: string, input: CreateMemberInput): Promise<Member> {
    return membersRepository.create({
      name: input.name.trim(),
      age: input.age.trim(),
      gender: input.gender,
      user: { connect: { id: userId } },
    });
  },

  async remove(userId: string, memberId: string): Promise<void> {
    const member = await membersRepository.findByIdForUser(memberId, userId);
    if (!member) {
      throw new NotFoundError("Member not found");
    }
    await membersRepository.delete(memberId);
  },
};
