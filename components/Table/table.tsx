"use client"

import { ReactNode } from "react"

import {
  Table as UITable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import Accordion from "@/components/Accordion/accordion"

import { cn } from "@/lib/utils"

type Column<T> = {
  key: keyof T | string
  label: string
  className?: string
  render?: (value: unknown, row: T) => ReactNode
}

type TableProps<T extends Record<string, unknown>> = {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  emptyMessage?: string
  className?: string
  rowKey?: keyof T | ((row: T, index: number) => string | number)
  accordion?: {
    title: string
    description?: string
    defaultOpen?: boolean
  }
}

export default function Table<T extends Record<string, unknown>>({
  columns,
  data,
  loading = false,
  emptyMessage = "Nenhum registro encontrado.",
  className,
  rowKey,
  accordion,
}: TableProps<T>) {
  const getRowKey = (row: T, index: number) => {
    if (typeof rowKey === "function") {
      return rowKey(row, index)
    }

    if (rowKey) {
      return String(row[rowKey])
    }

    return index
  }

  const getValue = (row: T, key: keyof T | string) => {
    return row[key as keyof T]
  }

  const table = (
    <div
      className={cn(
        "w-full overflow-hidden bg-muted/30",
        className
      )}
    >
      <div className="w-full overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <UITable className="min-w-[600px]">
          <TableHeader>
            <TableRow className="border-b hover:bg-transparent">
              {columns.map((column) => (
                <TableHead
                  key={String(column.key)}
                  className={cn(
                    "h-10 whitespace-nowrap px-4 text-xs font-medium text-muted-foreground",
                    column.className
                  )}
                >
                  {column.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <TableRow
                  key={`loading-${index}`}
                  className="border-b last:border-0"
                >
                  {columns.map((column) => (
                    <TableCell
                      key={String(column.key)}
                      className="px-4 py-3"
                    >
                      <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-28 px-4 text-center text-sm text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, index) => (
                <TableRow
                  key={getRowKey(row, index)}
                  className="border-b transition-colors last:border-0 hover:bg-muted/50"
                >
                  {columns.map((column, columnIndex) => {
                    const value = getValue(row, column.key)

                    return (
                      <TableCell
                        key={String(column.key)}
                        className={cn(
                          "px-4 py-3 text-sm",
                          columnIndex === 0 && "font-medium",
                          column.className
                        )}
                      >
                        {column.render
                          ? column.render(value, row)
                          : String(value ?? "-")}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </UITable>
      </div>
    </div>
  )

  if (!accordion) {
    return table
  }

  return (
    <Accordion
      items={[
        {
          id: "table",
          title: accordion.title,
          description: accordion.description,
          content: table,
        },
      ]}
      defaultOpen={
        accordion.defaultOpen ? "table" : undefined
      }
    />
  )
}