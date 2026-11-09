import { API } from "./api";
import type { AuthResponse, LoginRequest } from "@/types/auth";

class AuthService extends API {
  async loginWithGoogle(idToken: string): Promise<AuthResponse> {
    const response = await this.post<AuthResponse>(
      "/auth/google",
      { idToken } satisfies LoginRequest,
      false
    );

    localStorage.setItem("accessToken", response.accessToken);
    localStorage.setItem("user", JSON.stringify(response.user));

    localStorage.setItem("tokenType", response.tokenType);

    return response;
  }

  logout(): void {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
  }
}

export const authService = new AuthService();