
"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { feederService } from "@/services/FeederService"
import type { Feeder } from "@/types/feeder"

export default function Feeders() {
    const [feeders, setFeeders] = useState<Feeder[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)

    useEffect(() => {
        let active = true

        async function loadFeeders() {
            try {
                const response = await feederService.findAll()

                if (active) setFeeders(response)
            } catch (err) {
                console.error("Erro ao buscar alimentadores:", err)

                if (active) setError(true)
            } finally {
                if (active) setLoading(false)
            }
        }

        loadFeeders()

        return () => {
            active = false
        }
    }, [])

    if (loading) {
        return (
            <main className="p-6 lg:p-0 w-full max-w-4xl mx-auto">
                <div className="flex min-h-[55vh] flex-col items-center justify-center gap-5 text-center">
                    <p className="text-sm text-muted-foreground">
                        Procurando seus alimentadores...
                    </p>
                </div>
            </main>
        )
    }

    if (error || feeders.length === 0) {
        return (
            <main className="p-6 lg:p-0 w-full max-w-4xl mx-auto">
                <div className="flex min-h-[55vh] flex-col items-center justify-center gap-5 text-center">
                    <Image
                        src="/assets/dog.webp"
                        alt="Cachorro"
                        width={220}
                        height={220}
                        priority
                        className="h-auto w-full max-w-[220px] max-h-[160px] object-contain"
                    />

                    <div className="space-y-1">
                        <h1 className="text-lg font-semibold tracking-tight">
                            {error
                                ? "Ops! Não encontramos nossos alimentadores : ("
                                : "Nenhum alimentador por aqui para nós : ("}
                        </h1>

                        <p className="text-sm text-muted-foreground">
                            {error
                                ? "Não foi possível carregar os alimentadores. Tente novamente mais tarde."
                                : "Parece que você ainda não cadastrou nenhum alimentador. Que tal adicionar o primeiro?"}
                        </p>
                    </div>
                </div>
            </main>
        )
    }

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
