"use client"

import { usePathname } from "next/navigation"

import Navbar from "./Navbar/Navbar"
import Header from "./Header/Header"
import BottomBar from "./BottomBar/bottomBar"

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()

    const publicRoutes = ["/login"]

    const hideHeader = publicRoutes.some((route) =>
        pathname.startsWith(route)
    )

    return (
        <div className="flex h-dvh min-h-0 flex-col">
            {!hideHeader && (
                <header className="shrink-0">
                    <Navbar />
                </header>
            )}

            <div className="min-h-0 flex-1">
                <main className="h-full overflow-y-auto">
                    <div
                        className={`mx-auto w-full md:w-[90%] ${
                            hideHeader ? "" : "pb-14 md:pb-24"
                        }`}
                    >
                        {!hideHeader && <Header />}

                        {children}
                    </div>
                </main>
            </div>

            {!hideHeader && <BottomBar />}
        </div>
    )
}