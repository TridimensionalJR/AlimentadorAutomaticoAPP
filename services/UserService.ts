
import { API } from "./api";
import type { User } from "@/types/user";

export interface UserResponse {
  id: string;
  email: string;
  name: string;
}

class UserService extends API {
  async getMe(): Promise<UserResponse> {
    return this.get<UserResponse>("/me");
  }

  async deleteMe(): Promise<void> {
    await this.delete<void>("/me");
  }
}

export const userService = new UserService();
