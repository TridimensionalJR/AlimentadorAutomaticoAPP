"use client"

import Image from "next/image"
import Link from "next/link"

type Feeder = {
    id: number
    name: string
    active: boolean
}

const feeders: Feeder[] = [
    { id: 1, name: "Alimentador 01", active: true },
    { id: 2, name: "Alimentador 02", active: false },
    { id: 3, name: "Alimentador 03", active: true },
    { id: 4, name: "Alimentador 04", active: true },
]

export default function Feeders() {
    return (
        <main className="p-6 lg:p-0 w-full max-w-4xl mx-auto">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2">
                {feeders.map((feeder) => (
                    <Link
                        key={feeder.id}
                        href={`/alimentadores/${feeder.id}`}
                        className="relative block transition-opacity hover:opacity-90"
                    >
                        <Image
                            src="/assets/x.png"
                            alt={feeder.name}
                            width={800}
                            height={600}
                            className="h-auto w-full"
                        />

                        <div className="absolute left-[56%] top-[42%] w-[42%] text-left">
                            <p className="text-sm font-semibold tracking-tight text-white">
                                {feeder.name}
                            </p>

                            <span
                                className={`mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                    feeder.active
                                        ? "bg-emerald-400/15 text-emerald-200"
                                        : "bg-white/10 text-white/60"
                                }`}
                            >
                                <span
                                    className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
                                        feeder.active
                                            ? "bg-emerald-400"
                                            : "bg-white/40"
                                    }`}
                                />
                                {feeder.active ? "Ativo" : "Inativo"}
                            </span>
                        </div>
                    </Link>
                ))}
            </div>
        </main>
    )
}