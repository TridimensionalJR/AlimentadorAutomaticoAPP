"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { cn } from "@/lib/utils"

type ChartType = "bar" | "line" | "area" | "pie" | "scatter"

type ChartData = Record<string, string | number | boolean | null>

type ChartSeries = {
  dataKey: string
  label?: string
  color?: string
  stackId?: string
}

type ChartProps = {
  type?: ChartType
  data: ChartData[]
  series?: ChartSeries[]
  xKey?: string
  height?: number
  className?: string
  showGrid?: boolean
  showTooltip?: boolean
  showLegend?: boolean
  xAxis?: boolean
  yAxis?: boolean
  animated?: boolean
  emptyMessage?: string
}

export default function Chart({
  type = "line",
  data,
  series = [],
  xKey = "name",
  height = 320,
  className,
  showGrid = true,
  showTooltip = true,
  showLegend = false,
  xAxis = true,
  yAxis = true,
  animated = true,
  emptyMessage = "Nenhum dado disponível.",
}: ChartProps) {
  if (!data?.length) {
    return (
      <div
        className={cn(
          "flex w-full items-center justify-center rounded-md border text-sm text-muted-foreground",
          className
        )}
        style={{ height }}
      >
        {emptyMessage}
      </div>
    )
  }

  const grid = showGrid ? (
    <CartesianGrid strokeDasharray="3 3" vertical={false} />
  ) : null

  const axes = (
    <>
      {xAxis && (
        <XAxis
          dataKey={xKey}
          axisLine={false}
          tickLine={false}
          tickMargin={10}
        />
      )}

      {yAxis && (
        <YAxis
          axisLine={false}
          tickLine={false}
          tickMargin={10}
        />
      )}
    </>
  )

  const tooltip = showTooltip ? <Tooltip /> : null
  const legend = showLegend ? <Legend /> : null

  if (type === "pie") {
    const valueKey = series[0]?.dataKey || "value"

    return (
      <div className={cn("w-full", className)} style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            {tooltip}
            {legend}

            <Pie
              data={data}
              dataKey={valueKey}
              nameKey={xKey}
              cx="50%"
              cy="50%"
              outerRadius="75%"
              isAnimationActive={animated}
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={`hsl(${(index * 47) % 360} 70% 50%)`}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
    )
  }

  if (type === "scatter") {
    return (
      <div className={cn("w-full", className)} style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart>
            {grid}
            {tooltip}
            {legend}
            {axes}

            {series.map((item) => (
              <Scatter
                key={item.dataKey}
                name={item.label || item.dataKey}
                data={data}
                dataKey={item.dataKey}
                fill={item.color}
                isAnimationActive={animated}
              />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    )
  }

  if (type === "bar") {
    return (
      <div className={cn("w-full", className)} style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            {grid}
            {tooltip}
            {legend}
            {axes}

            {series.map((item) => (
              <Bar
                key={item.dataKey}
                dataKey={item.dataKey}
                name={item.label || item.dataKey}
                fill={item.color}
                stackId={item.stackId}
                radius={[4, 4, 0, 0]}
                isAnimationActive={animated}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    )
  }

  if (type === "area") {
    return (
      <div className={cn("w-full", className)} style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            {grid}
            {tooltip}
            {legend}
            {axes}

            {series.map((item) => (
              <Line
                key={item.dataKey}
                type="monotone"
                dataKey={item.dataKey}
                name={item.label || item.dataKey}
                stroke={item.color}
                strokeWidth={2}
                fill={item.color}
                fillOpacity={0.1}
                dot={false}
                isAnimationActive={animated}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    )
  }

  return (
    <div className={cn("w-full", className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          {grid}
          {tooltip}
          {legend}
          {axes}

          {series.map((item) => (
            <Line
              key={item.dataKey}
              type="monotone"
              dataKey={item.dataKey}
              name={item.label || item.dataKey}
              stroke={item.color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5 }}
              isAnimationActive={animated}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}