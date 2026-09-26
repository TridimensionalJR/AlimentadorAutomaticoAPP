"use client"

import { usePathname } from "next/navigation"

const pageNames: Record<string, string> = {
  "/": "Início",
  "/dashboard": "Dashboard",
  "/conta": "Conta",
  "/alimentadores": "Alimentadores",
}

export default function Header() {
  const pathname = usePathname()

  const name =
    Object.entries(pageNames).find(([route]) =>
      pathname === route || pathname.startsWith(`${route}/`)
    )?.[1] || "Início"

  return (
    <header className="flex h-24 items-center px-6">
      <h1 className="text-3xl font-light">{name}</h1>
    </header>
  )
}