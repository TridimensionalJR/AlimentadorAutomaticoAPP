"use client"

import { ReactNode } from "react"
import { FiArrowDown, FiArrowUp, FiMinus } from "react-icons/fi"

import { cn } from "@/lib/utils"

type MetricCardProps = {
  title: string
  value: string | number
  description?: string
  trend?: number
  trendLabel?: string
  icon?: ReactNode
  className?: string
}

export default function MetricCard({
  title,
  value,
  description,
  trend,
  trendLabel,
  icon,
  className,
}: MetricCardProps) {
  const hasTrend = typeof trend === "number"
  const positive = hasTrend && trend > 0
  const negative = hasTrend && trend < 0

  return (
    <div
      className={cn(
        "rounded-md border bg-background p-5",
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">
            {title}
          </p>

          <p className="mt-2 text-2xl font-semibold tracking-tight">
            {value}
          </p>
        </div>

        {icon && (
          <div className="flex size-10 shrink-0 items-center justify-center rounded-md border bg-muted/40">
            {icon}
          </div>
        )}
      </div>

      {(description || hasTrend) && (
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
          {hasTrend && (
            <span
              className={cn(
                "inline-flex items-center gap-1 font-medium",
                positive && "text-emerald-600",
                negative && "text-red-600",
                !positive && !negative && "text-muted-foreground"
              )}
            >
              {positive ? (
                <FiArrowUp className="size-3.5" />
              ) : negative ? (
                <FiArrowDown className="size-3.5" />
              ) : (
                <FiMinus className="size-3.5" />
              )}

              {Math.abs(trend)}%
            </span>
          )}

          {trendLabel && (
            <span className="text-muted-foreground">
              {trendLabel}
            </span>
          )}

          {description && !trendLabel && (
            <span className="text-muted-foreground">
              {description}
            </span>
          )}
        </div>
      )}
    </div>
  )
}