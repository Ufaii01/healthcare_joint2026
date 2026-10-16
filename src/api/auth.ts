// Frontend auth API client. Talks to the Express backend and stores the JWT
// (via the shared client) so the session survives refreshes.
import { request, setToken, clearToken, getToken, ApiError } from "./client";

export { ApiError, getToken };

export type ApiUser = {
  id: string;
  name: string;
  email: string;
  age: string;
  gender: "Female" | "Male" | "";
  contact: string;
  address: string;
  avatar: string;
  language: string;
  bookingUpdates: boolean;
  resultAlerts: boolean;
  healthTips: boolean;
  twoFactor: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AuthResult = { token: string; user: ApiUser };

export type ProfileUpdate = Partial<{
  name: string;
  age: string;
  gender: "Female" | "Male" | "";
  contact: string;
  address: string;
  avatar: string;
  language: string;
  bookingUpdates: boolean;
  resultAlerts: boolean;
  healthTips: boolean;
  twoFactor: boolean;
}>;

export const authApi = {
  async register(input: { name: string; email: string; password: string }): Promise<AuthResult> {
    const result = await request<AuthResult>("/api/auth/register", { method: "POST", body: JSON.stringify(input) });
    setToken(result.token);
    return result;
  },

  async login(input: { email: string; password: string }): Promise<AuthResult> {
    const result = await request<AuthResult>("/api/auth/login", { method: "POST", body: JSON.stringify(input) });
    setToken(result.token);
    return result;
  },

  async me(): Promise<ApiUser> {
    const { user } = await request<{ user: ApiUser }>("/api/auth/me", { method: "GET" });
    return user;
  },

  async updateProfile(input: ProfileUpdate): Promise<ApiUser> {
    const { user } = await request<{ user: ApiUser }>("/api/auth/me", { method: "PATCH", body: JSON.stringify(input) });
    return user;
  },

  async changePassword(input: { currentPassword: string; newPassword: string }): Promise<void> {
    await request<{ message: string }>("/api/auth/change-password", { method: "POST", body: JSON.stringify(input) });
  },

  logout() {
    clearToken();
  },
};
