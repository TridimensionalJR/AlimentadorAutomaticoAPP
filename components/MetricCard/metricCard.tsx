"use client"

import { ReactNode } from "react"

import {
  FiArrowDown,
  FiArrowUp,
  FiMinus,
} from "react-icons/fi"

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
        "min-h-28 rounded-xl bg-muted/50 px-4 py-3",
        className
      )}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          {icon && (
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-background">
              {icon}
            </div>
          )}

          <p className="truncate text-xs font-medium text-muted-foreground">
            {title}
          </p>
        </div>

        <p className="mt-2 text-2xl font-semibold tracking-tight">
          {value}
        </p>

        {(description || hasTrend) && (
          <div className="mt-0.5 flex items-center gap-1.5 text-[11px]">
            {hasTrend && (
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 font-medium",
                  positive && "text-emerald-600",
                  negative && "text-red-600",
                  !positive &&
                    !negative &&
                    "text-muted-foreground"
                )}
              >
                {positive ? (
                  <FiArrowUp className="size-3" />
                ) : negative ? (
                  <FiArrowDown className="size-3" />
                ) : (
                  <FiMinus className="size-3" />
                )}

                {Math.abs(trend)}%
              </span>
            )}

            {trendLabel && (
              <span className="truncate text-muted-foreground">
                {trendLabel}
              </span>
            )}

            {description && !trendLabel && (
              <span className="truncate text-muted-foreground">
                {description}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}