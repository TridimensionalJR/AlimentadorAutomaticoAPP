"use client"

import { useState } from "react"

import Form from "@/components/Form/form"

export default function Account() {
    const [values, setValues] = useState({
        name: "Daniel Gomes",
        email: "daniel@exemplo.com",
        phone: "",
        password: "",
        passwordConfirmation: "",
    })

    const handleChange = (name: string, value: unknown) => {
        setValues((current) => ({
            ...current,
            [name]: value,
        }))
    }

    const handleSubmit = async () => {
        // salvar dados da conta
    }

    return (
        <main className="p-6">
            <div className="mx-auto w-full max-w-4xl">
                <Form
                    mode="edit"
                    title="Editar"
                    description="Gerencie suas informações pessoais e dados de acesso."
                    fields={[
                        {
                            name: "name",
                            label: "Nome",
                            type: "text",
                            placeholder: "Digite seu nome",
                            required: true,
                        },
                        {
                            name: "email",
                            label: "E-mail",
                            type: "email",
                            placeholder: "Digite seu e-mail",
                            required: true,
                        },
                        {
                            name: "phone",
                            label: "Telefone",
                            type: "text",
                            placeholder: "Digite seu telefone",
                        },
                    ]}
                    values={values}
                    onChange={handleChange}
                    onSubmit={handleSubmit}
                    submitText="Salvar alterações"
                />
            </div>
        </main>
    )
}