
"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import Navbar from "./Navbar/Navbar";
import Header from "./Header/Header";
import BottomBar from "./BottomBar/bottomBar";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();

  const publicRoutes = ["/login"];
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`));

  useEffect(() => {
    if (!loading && !user && !isPublicRoute) {
      router.replace("/login");
    }
  }, [user, loading, isPublicRoute, router]);

  if (loading || (!user && !isPublicRoute)) {
    return (
      <div className="flex h-dvh items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-current border-t-transparent" />
      </div>
    );
  }

  const headerActions = [
    {
      type: "button" as const,
      label: "Novo alimentador",
      icon: <Plus className="h-5 w-5" />,
      circular: true,
      variant: "default" as const,
      onClick: () => router.push("/alimentadores/novo"),
    },
  ];

  return (
    <div className="flex h-dvh min-h-0 flex-col">
      {!isPublicRoute && (
        <header className="shrink-0">
          <Navbar />
        </header>
      )}

      <div className="min-h-0 flex-1">
        <main className="h-full overflow-y-auto">
          <div className={`mx-auto w-full md:w-[90%] ${isPublicRoute ? "" : "pb-14 md:pb-24"}`}>
            {!isPublicRoute && (
              <Header actions={pathname === "/alimentadores" ? headerActions : []} />
            )}
            {children}
          </div>
        </main>
      </div>

      {!isPublicRoute && <BottomBar />}
    </div>
  );
}
