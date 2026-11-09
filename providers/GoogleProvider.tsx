
"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { ReactNode } from "react";
import { AuthProvider } from "@/hooks/useAuth";

export default function GoogleProvider({ children }: { children: ReactNode }) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  if (!clientId) throw new Error("NEXT_PUBLIC_GOOGLE_CLIENT_ID não configurada");

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <AuthProvider>{children}</AuthProvider>
    </GoogleOAuthProvider>
  );
}
