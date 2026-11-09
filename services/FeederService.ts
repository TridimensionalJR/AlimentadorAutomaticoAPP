
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface ApiError {
  message: string;
  status?: number;
  errors?: Record<string, string[]>;
}

export class API {
  protected baseURL: string;

  constructor(baseURL = API_URL) {
    if (!baseURL) throw new Error("NEXT_PUBLIC_API_URL não configurada");
    this.baseURL = baseURL.replace(/\/+$/, "");
  }

  protected getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("accessToken");
  }

  protected async request<T>(
    endpoint: string,
    options: RequestInit = {},
    authenticated = true
  ): Promise<T> {
    const token = authenticated ? this.getToken() : null;
    const headers = new Headers(options.headers);

    if (!(options.body instanceof FormData) && !headers.has("Content-Type"))
      headers.set("Content-Type", "application/json");

    if (token) {
      const tokenType = localStorage.getItem("tokenType") || "Bearer";
      headers.set("Authorization", `${tokenType} ${token}`);
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 204) return undefined as T;

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw {
        message: data?.message || data?.error || "Erro na requisição",
        status: response.status,
        errors: data?.errors,
      } satisfies ApiError;
    }

    return data as T;
  }

  protected getRequest<T>(endpoint: string, authenticated = true) {
    return this.request<T>(endpoint, { method: "GET" }, authenticated);
  }

  protected postRequest<T>(
    endpoint: string,
    body?: unknown,
    authenticated = true
  ) {
    return this.request<T>(
      endpoint,
      {
        method: "POST",
        body: body instanceof FormData
          ? body
          : body !== undefined
            ? JSON.stringify(body)
            : undefined,
      },
      authenticated
    );
  }

  protected putRequest<T>(endpoint: string, body?: unknown) {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  }

  protected patchRequest<T>(endpoint: string, body?: unknown) {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  }

  protected deleteRequest<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}
