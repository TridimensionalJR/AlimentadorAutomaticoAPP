"use client"

import { ReactNode } from "react"
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

  const handleChange = (name: string, value: unknown) => {
    if (!readonly) onChange(name, value)
  }

  const handleSubmit = async () => {
    if (!onSubmit) return

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
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível concluir a operação."

      toast.error(message)
    }
  }

  const renderField = (field: Field) => {
    const value = values[field.name]
    const disabled = readonly || field.disabled

    if (field.type === "custom" && field.render) {
      return field.render(value, (newValue) =>
        handleChange(field.name, newValue)
      )
    }

    if (field.type === "textarea") {
      return (
        <Textarea
          value={String(value ?? "")}
          placeholder={field.placeholder}
          disabled={disabled}
          onChange={(event) =>
            handleChange(field.name, event.target.value)
          }
          className="min-h-32 resize-y rounded-md px-4 py-3 text-sm"
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
          <SelectTrigger className="h-12 rounded-md px-4">
            <SelectValue
              placeholder={field.placeholder || "Selecione"}
            />
          </SelectTrigger>

          <SelectContent>
            {field.options?.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
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
        <div className="flex h-12 items-center">
          <Switch
            checked={Boolean(value)}
            disabled={disabled}
            onCheckedChange={(checked) =>
              handleChange(field.name, checked)
            }
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
        className="h-12 rounded-md px-4 text-sm"
      />
    )
  }

  return (
    <div className="w-full">
      {(title || description) && (
        <div className="mb-6">
          <div className="flex items-center gap-2">
            {mode === "view" ? (
              <FiEye className="size-5 text-muted-foreground" />
            ) : mode === "edit" ? (
              <FiEdit3 className="size-5 text-muted-foreground" />
            ) : (
              <FiSave className="size-5 text-muted-foreground" />
            )}

            {title && (
              <h2 className="text-xl font-semibold tracking-tight">
                {title}
              </h2>
            )}
          </div>

          {description && (
            <p className="mt-1 text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {fields.map((field) => (
          <div
            key={field.name}
            className={
              field.type === "textarea" || field.type === "custom"
                ? "md:col-span-2"
                : ""
            }
          >
            <div className="space-y-2">
              <Label
                htmlFor={field.name}
                className="text-sm font-medium"
              >
                {field.label}

                {field.required && (
                  <span className="ml-1 text-red-500">*</span>
                )}
              </Label>

              {renderField(field)}

              {field.description && (
                <p className="text-xs text-muted-foreground">
                  {field.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {children}

      {!readonly && onSubmit && (
        <div className="mt-7 flex justify-end border-t pt-5">
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="h-11 rounded-md px-6"
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