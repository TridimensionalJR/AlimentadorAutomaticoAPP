"use client"

import { ReactNode, useState } from "react"

import { FiChevronDown } from "react-icons/fi"

import { cn } from "@/lib/utils"

type AccordionItem = {
  id: string
  title: string
  description?: string
  content: ReactNode
  disabled?: boolean
}

type AccordionProps = {
  items: AccordionItem[]
  multiple?: boolean
  defaultOpen?: string | string[]
  className?: string
}

export default function Accordion({
  items,
  multiple = false,
  defaultOpen,
  className,
}: AccordionProps) {
  const getInitialOpen = () => {
    if (!defaultOpen) return []

    return Array.isArray(defaultOpen)
      ? defaultOpen
      : [defaultOpen]
  }

  const [openItems, setOpenItems] = useState<string[]>(
    getInitialOpen
  )

  const toggleItem = (id: string) => {
    setOpenItems((current) => {
      const isOpen = current.includes(id)

      if (isOpen) {
        return current.filter((item) => item !== id)
      }

      if (!multiple) {
        return [id]
      }

      return [...current, id]
    })
  }

  return (
    <div className={cn("w-full space-y-3", className)}>
      {items.map((item) => {
        const isOpen = openItems.includes(item.id)

        return (
          <div
            key={item.id}
            className="overflow-hidden rounded-xl bg-muted/50"
          >
            <button
              type="button"
              disabled={item.disabled}
              onClick={() => toggleItem(item.id)}
              className={cn(
                "flex w-full items-center justify-between gap-4 px-4 py-3.5 text-left transition-colors",
                "hover:bg-muted",
                item.disabled &&
                  "cursor-not-allowed opacity-50"
              )}
              aria-expanded={isOpen}
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold">
                  {item.title}
                </p>

                {item.description && (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {item.description}
                  </p>
                )}
              </div>

              <div
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full bg-background transition-transform duration-200",
                  isOpen && "rotate-180"
                )}
              >
                <FiChevronDown className="size-4 text-muted-foreground" />
              </div>
            </button>

            <div
              className={cn(
                "grid transition-[grid-template-rows] duration-200",
                isOpen
                  ? "grid-rows-[1fr]"
                  : "grid-rows-[0fr]"
              )}
            >
              <div className="min-h-0 overflow-hidden">
                <div className="px-4 pb-4">
                  {item.content}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}