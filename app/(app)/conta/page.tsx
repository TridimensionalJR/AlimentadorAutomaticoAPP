"use client"

import { useEffect, useState } from "react"
import { userService, type UserResponse } from "@/services/UserService"

export default function Account() {
    const [user, setUser] = useState<UserResponse | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        userService.getMe()
            .then(setUser)
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    return (
        <main className="p-6">
            <div className="mx-auto w-full max-w-4xl space-y-6">

                {loading ? (
                    <p className="text-sm text-muted-foreground">Carregando...</p>
                ) : user ? (
                    <div className="space-y-5 rounded-lg border p-5">
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Nome</label>
                            <p className="text-sm text-muted-foreground">{user.name}</p>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium">E-mail</label>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">
                        Não foi possível carregar os dados da conta.
                    </p>
                )}
            </div>
        </main>
    )
}