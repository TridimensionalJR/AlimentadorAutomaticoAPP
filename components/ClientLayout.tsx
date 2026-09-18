"use client"

import { usePathname } from "next/navigation"
import { useState } from "react"

import Navbar from "./Navbar/Navbar"
import BottomBar from "./BottomBar/bottomBar"

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const publicRoutes = [
    "/login"
  ]

  const hideHeader = publicRoutes.some((route) =>
    pathname.startsWith(route)
  )

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="flex min-w-0 flex-1 flex-col">
        {!hideHeader && (
          <header className="sticky top-0 z-30">
            <Navbar />
          </header>
        )}

        <main
          className={`flex-1 overflow-y-auto ${
            hideHeader ? "" : "pb-16 md:pb-0"
          }`}
        >
          {children}
        </main>
      </div>

      {!hideHeader && (
        <div className="">
          <BottomBar />
        </div>
      )}
    </div>
  )
}