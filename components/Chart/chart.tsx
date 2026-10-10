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

type ChartData = Record<
  string,
  string | number | boolean | null
>

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

const chartAxis = {
  fontSize: 11,
  fill: "hsl(var(--muted-foreground))",
}

const tooltipStyle = {
  borderRadius: "12px",
  border: "1px solid hsl(var(--border))",
  background: "hsl(var(--background))",
  boxShadow: "0 4px 12px rgb(0 0 0 / 0.06)",
  fontSize: "12px",
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
          "flex w-full items-center justify-center rounded-xl bg-muted/50 text-sm text-muted-foreground",
          className
        )}
        style={{ height }}
      >
        {emptyMessage}
      </div>
    )
  }

  const grid = showGrid ? (
    <CartesianGrid
      strokeDasharray="3 6"
      vertical={false}
      stroke="hsl(var(--border))"
      strokeOpacity={0.45}
    />
  ) : null

  const axes = (
    <>
      {xAxis && (
        <XAxis
          dataKey={xKey}
          axisLine={false}
          tickLine={false}
          tickMargin={10}
          tick={chartAxis}
        />
      )}

      {yAxis && (
        <YAxis
          axisLine={false}
          tickLine={false}
          tickMargin={10}
          tick={chartAxis}
        />
      )}
    </>
  )

  const tooltip = showTooltip ? (
    <Tooltip
      contentStyle={tooltipStyle}
      cursor={{
        stroke: "hsl(var(--border))",
        strokeWidth: 1,
      }}
    />
  ) : null

  const legend = showLegend ? (
    <Legend
      wrapperStyle={{
        fontSize: "12px",
        paddingTop: "8px",
      }}
    />
  ) : null

  if (type === "pie") {
    const valueKey = series[0]?.dataKey || "value"

    return (
      <div
        className={cn(
          "w-full rounded-xl bg-muted/50 p-2",
          className
        )}
        style={{ height }}
      >
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
              outerRadius="72%"
              innerRadius="42%"
              paddingAngle={3}
              strokeWidth={0}
              isAnimationActive={animated}
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={`hsl(${(index * 47) % 360} 70% 50%)`}
                  stroke="none"
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
      <div
        className={cn(
          "w-full rounded-xl bg-muted/50 p-2",
          className
        )}
        style={{ height }}
      >
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
      <div
        className={cn(
          "w-full rounded-xl bg-muted/50 p-2",
          className
        )}
        style={{ height }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 8,
              right: 8,
              bottom: 4,
              left: 0,
            }}
          >
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
                radius={[6, 6, 2, 2]}
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
      <div
        className={cn(
          "w-full rounded-xl bg-muted/50 p-2",
          className
        )}
        style={{ height }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 12,
              right: 8,
              bottom: 4,
              left: 0,
            }}
          >
            {grid}
            {tooltip}
            {legend}
            {axes}

            {series.map((item) => (
              <Line
                key={item.dataKey}
                type="natural"
                dataKey={item.dataKey}
                name={item.label || item.dataKey}
                stroke={item.color}
                strokeWidth={4}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill={item.color}
                fillOpacity={0.06}
                dot={false}
                activeDot={{
                  r: 6,
                  strokeWidth: 0,
                }}
                isAnimationActive={animated}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "w-full rounded-xl bg-muted/50 p-2",
        className
      )}
      style={{ height }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 12,
            right: 8,
            bottom: 4,
            left: 0,
          }}
        >
          {grid}
          {tooltip}
          {legend}
          {axes}

          {series.map((item) => (
            <Line
              key={item.dataKey}
              type="natural"
              dataKey={item.dataKey}
              name={item.label || item.dataKey}
              stroke={item.color}
              strokeWidth={4}
              strokeLinecap="round"
              strokeLinejoin="round"
              dot={false}
              activeDot={{
                r: 6,
                strokeWidth: 0,
              }}
              isAnimationActive={animated}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}