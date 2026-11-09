import type { User } from "./user";

export interface LoginRequest {
  idToken: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: "Bearer";
  expiresIn: number;
  user: User;
}