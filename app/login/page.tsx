
"use client";

import Image from "next/image";
import { useState } from "react";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { useAuth } from "@/hooks/useAuth";

export default function Login() {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleLogin = async (response: CredentialResponse) => {
    if (!response.credential) {
      setError("Não foi possível obter a credencial do Google.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await login(response.credential);
    } catch (err) {
      const message =
        typeof err === "object" && err !== null && "message" in err
          ? String(err.message)
          : "Não foi possível realizar o login.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="space-y-4 text-center">
          <Image
            src="/assets/logo.png"
            alt="Tridimensional Jr"
            width={100}
            height={100}
            className="mx-auto h-20 w-auto object-contain"
            priority
          />

          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              Entre ou crie sua conta
            </h1>
            <p className="text-sm text-muted-foreground">
              Continue com sua conta Google para acessar a plataforma.
            </p>
          </div>
        </div>

        <div className={loading ? "pointer-events-none opacity-50" : ""}>
          <GoogleLogin
            onSuccess={handleGoogleLogin}
            onError={() => setError("Falha na autenticação com o Google.")}
            theme="outline"
            size="large"
            shape="rectangular"
            text="continue_with"
            width="350"
          />
        </div>

        {loading && (
          <p className="text-center text-sm text-muted-foreground">
            Entrando...
          </p>
        )}

        {error && (
          <p className="text-center text-sm text-destructive">{error}</p>
        )}

        <p className="text-center text-xs text-muted-foreground">
          2026 &copy; Tridimensional Jr
        </p>
      </div>
    </main>
  );
}
