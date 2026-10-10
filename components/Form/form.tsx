"use client"

import { ReactNode, useMemo, useState } from "react"
import { z } from "zod"
import { FiCheck, FiEdit3, FiEye, FiSave } from "react-icons/fi"
import { toast } from "react-toastify"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

type FormMode = "create" | "edit" | "view"

type Option = {
    label: string
    value: string
}

type Field = {
    name: string
    label: string
    type?:
        | "text"
        | "email"
        | "number"
        | "password"
        | "date"
        | "textarea"
        | "select"
        | "switch"
        | "custom"
    placeholder?: string
    description?: string
    required?: boolean
    disabled?: boolean
    options?: Option[]
    validation?: z.ZodType
    render?: (
        value: unknown,
        setValue: (value: unknown) => void
    ) => ReactNode
}

type FormProps = {
    mode?: FormMode
    title?: string
    description?: string
    fields: Field[]
    values: Record<string, unknown>
    onChange: (name: string, value: unknown) => void
    onSubmit?: () => void | Promise<void | string>
    submitText?: string
    loading?: boolean
    children?: ReactNode
}

export default function Form({
    mode = "create",
    title,
    description,
    fields,
    values,
    onChange,
    onSubmit,
    submitText,
    loading = false,
    children,
}: FormProps) {
    const readonly = mode === "view"
    const [errors, setErrors] = useState<Record<string, string>>({})

    const schema = useMemo(() => {
        const shape: Record<string, z.ZodType> = {}

        fields.forEach((field) => {
            if (field.validation) {
                shape[field.name] = field.validation
                return
            }

            let fieldSchema: z.ZodType

            switch (field.type) {
                case "number":
                    fieldSchema = z.coerce.number({
                        message: `${field.label} deve ser um número válido.`,
                    })
                    break
                case "switch":
                    fieldSchema = z.boolean()
                    break
                default:
                    fieldSchema = z.string()
            }

            if (field.required) {
                if (field.type === "switch") {
                    fieldSchema = z.boolean()
                } else if (field.type === "number") {
                    fieldSchema = z.coerce
                        .number({
                            message: `${field.label} deve ser um número válido.`,
                        })
                        .refine((value) => !Number.isNaN(value), {
                            message: `${field.label} é obrigatório.`,
                        })
                } else {
                    fieldSchema = z.string().trim().min(1, {
                        message: `${field.label} é obrigatório.`,
                    })
                }
            } else if (field.type !== "switch") {
                fieldSchema = fieldSchema.optional()
            }

            if (field.type === "email" && !field.validation) {
                fieldSchema = field.required
                    ? z
                          .string()
                          .trim()
                          .min(1, `${field.label} é obrigatório.`)
                          .email("Digite um e-mail válido.")
                    : z
                          .string()
                          .trim()
                          .email("Digite um e-mail válido.")
                          .optional()
            }

            shape[field.name] = fieldSchema
        })

        return z.object(shape)
    }, [fields])

    const handleChange = (name: string, value: unknown) => {
        if (readonly) return

        onChange(name, value)

        if (errors[name]) {
            setErrors((current) => {
                const next = { ...current }
                delete next[name]
                return next
            })
        }
    }

    const handleSubmit = async () => {
        if (!onSubmit) return

        const result = schema.safeParse(values)

        if (!result.success) {
            const fieldErrors: Record<string, string> = {}

            result.error.issues.forEach((issue) => {
                const fieldName = issue.path[0]

                if (
                    typeof fieldName === "string" &&
                    !fieldErrors[fieldName]
                ) {
                    fieldErrors[fieldName] = issue.message
                }
            })

            setErrors(fieldErrors)

            const firstError = Object.values(fieldErrors)[0]

            if (firstError) {
                toast.error(firstError)
            }

            return
        }

        setErrors({})

        try {
            const message = await onSubmit()

            toast.success(
                typeof message === "string"
                    ? message
                    : mode === "edit"
                      ? "Alterações salvas com sucesso."
                      : "Cadastro realizado com sucesso."
            )
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Não foi possível concluir a operação."
            )
        }
    }

    const renderField = (field: Field) => {
        const value = values[field.name]
        const disabled = readonly || field.disabled
        const error = errors[field.name]

        if (field.type === "custom" && field.render) {
            return field.render(value, (newValue) =>
                handleChange(field.name, newValue)
            )
        }

        if (field.type === "textarea") {
            return (
                <Textarea
                    id={field.name}
                    value={String(value ?? "")}
                    placeholder={field.placeholder}
                    disabled={disabled}
                    onChange={(event) =>
                        handleChange(field.name, event.target.value)
                    }
                    className={`min-h-28 resize-y rounded-lg px-3 py-2.5 text-sm sm:min-h-32 sm:px-4 sm:py-3 ${
                        error
                            ? "border-red-500 focus-visible:ring-red-500"
                            : ""
                    }`}
                />
            )
        }

        if (field.type === "select") {
            return (
                <Select
                    value={String(value ?? "")}
                    disabled={disabled}
                    onValueChange={(newValue) =>
                        handleChange(field.name, newValue)
                    }
                >
                    <SelectTrigger
                        id={field.name}
                        className={`h-11 cursor-pointer rounded-lg px-3 sm:h-12 sm:px-4 ${
                            error
                                ? "border-red-500 focus:ring-red-500"
                                : ""
                        }`}
                    >
                        <SelectValue
                            placeholder={field.placeholder || "Selecione"}
                        />
                    </SelectTrigger>

                    <SelectContent>
                        {field.options?.map((option) => (
                            <SelectItem
                                key={option.value}
                                value={option.value}
                                className="cursor-pointer"
                            >
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )
        }

        if (field.type === "switch") {
            return (
                <div className="flex h-11 items-center sm:h-12">
                    <Switch
                        checked={Boolean(value)}
                        disabled={disabled}
                        onCheckedChange={(checked) =>
                            handleChange(field.name, checked)
                        }
                        className="cursor-pointer"
                    />
                </div>
            )
        }

        return (
            <Input
                id={field.name}
                type={field.type || "text"}
                value={String(value ?? "")}
                placeholder={field.placeholder}
                disabled={disabled}
                onChange={(event) =>
                    handleChange(field.name, event.target.value)
                }
                className={`h-11 rounded-lg px-3 text-sm sm:h-12 sm:px-4 ${
                    error
                        ? "border-red-500 focus-visible:ring-red-500"
                        : ""
                }`}
            />
        )
    }

    return (
        <div className="w-full">
            {(title || description) && (
                <div className="mb-5 sm:mb-6">
                    <div className="flex items-center gap-2">
                        {mode === "view" ? (
                            <FiEye className="size-4 text-muted-foreground sm:size-5" />
                        ) : mode === "edit" ? (
                            <FiEdit3 className="size-4 text-muted-foreground sm:size-5" />
                        ) : (
                            <FiSave className="size-4 text-muted-foreground sm:size-5" />
                        )}

                        {title && (
                            <h2 className="text-lg font-semibold tracking-tight sm:text-xl">
                                {title}
                            </h2>
                        )}
                    </div>

                    {description && (
                        <p className="mt-1 text-xs leading-5 text-muted-foreground sm:text-sm">
                            {description}
                        </p>
                    )}
                </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
                {fields.map((field) => (
                    <div
                        key={field.name}
                        className={
                            field.type === "textarea" ||
                            field.type === "custom"
                                ? "md:col-span-2"
                                : ""
                        }
                    >
                        <div className="space-y-1.5 sm:space-y-2">
                            <Label
                                htmlFor={field.name}
                                className="text-xs font-medium sm:text-sm"
                            >
                                {field.label}

                                {field.required && (
                                    <span className="ml-1 text-red-500">
                                        *
                                    </span>
                                )}
                            </Label>

                            {renderField(field)}

                            {errors[field.name] ? (
                                <p className="text-[11px] leading-4 text-red-500 sm:text-xs">
                                    {errors[field.name]}
                                </p>
                            ) : field.description ? (
                                <p className="text-[11px] leading-4 text-muted-foreground sm:text-xs">
                                    {field.description}
                                </p>
                            ) : null}
                        </div>
                    </div>
                ))}
            </div>

            {children}

            {!readonly && onSubmit && (
                <div className="mt-6 flex flex-col-reverse gap-3 border-t pt-4 sm:mt-7 sm:flex-row sm:justify-end sm:pt-5">
                    <Button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading}
                        className="h-11 w-full cursor-pointer rounded-lg px-6 sm:w-auto"
                    >
                        <FiCheck className="mr-2 size-4" />

                        {loading
                            ? "Salvando..."
                            : submitText ||
                              (mode === "edit"
                                  ? "Salvar alterações"
                                  : "Criar")}
                    </Button>
                </div>
            )}
        </div>
    )
}