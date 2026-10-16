import { request } from "./client";
import type { Member } from "../members";

export const membersApi = {
  async list(): Promise<Member[]> {
    const { members } = await request<{ members: Member[] }>("/api/members", { method: "GET" });
    return members;
  },

  async create(input: Omit<Member, "id">): Promise<Member> {
    const { member } = await request<{ member: Member }>("/api/members", {
      method: "POST",
      body: JSON.stringify(input),
    });
    return member;
  },

  async remove(id: string): Promise<void> {
    await request<null>(`/api/members/${encodeURIComponent(id)}`, { method: "DELETE" });
  },
};
