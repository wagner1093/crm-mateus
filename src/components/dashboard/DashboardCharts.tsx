"use client"

import * as React from "react"
import { TrendingUp, TrendingDown } from "lucide-react"
import { 
  Area, 
  AreaChart, 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  Pie, 
  PieChart, 
  Label,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  Legend
} from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

// ── AREA CHART COMPONENT ───────────────────────

interface AreaChartProps {
  data: { month: string; revenue: number }[]
  title?: string
}

export function SalesAreaChart({ data, title = "Análise de Faturamento" }: AreaChartProps) {
  const chartConfig = {
    revenue: {
      label: "Faturamento",
      color: "#4F46E5",
    },
  } satisfies ChartConfig

  return (
    <Card className="rounded-[24px] border border-slate-100 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="grid gap-1">
          <CardTitle className="text-[16px] font-bold text-slate-800">Análise de Faturamento</CardTitle>
          <CardDescription className="text-[13px] font-medium text-slate-500">
            Evolução mensal do faturamento em {new Date().getFullYear()}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4">
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <AreaChart
            data={data}
            margin={{ left: 12, right: 12, top: 10, bottom: 0 }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value}
              style={{ fontSize: '10px', fontWeight: 'bold', fill: '#94a3b8' }}
            />
            <YAxis hide domain={[0, 'auto']} />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <defs>
              <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              dataKey="revenue"
              type="natural"
              fill="url(#fillRevenue)"
              stroke="#4F46E5"
              strokeWidth={2}
              stackId="a"
              animationDuration={1500}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

// ── INVOICE STATS CHART (DONUT) ──────────────────

interface InvoiceStatsProps {
  data: { status: string; count: number; color: string }[]
}

export function InvoiceStatsChart() {
  const chartData = [
    { name: "Pago", value: 0, fill: "#10B981" },
    { name: "Pendente", value: 0, fill: "#8B5CF6" },
    { name: "Atrasado", value: 1, fill: "#1e1b4b" }, // dark blue/black
  ]

  const chartConfig = {
    pago: { label: "Pago", color: "#10B981" },
    pendente: { label: "Pendente", color: "#8B5CF6" },
    atrasado: { label: "Atrasado", color: "#1e1b4b" }
  } satisfies ChartConfig

  const totalInvoices = chartData.reduce((acc, curr) => acc + curr.value, 0)

  return (
    <Card className="rounded-[24px] border border-slate-100 shadow-sm h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-[16px] font-bold text-slate-800">Estatísticas de Faturas</CardTitle>
        <CardDescription className="text-[13px] font-medium text-slate-500">
          Distribuição por status
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="flex-1 relative flex items-center justify-center min-h-[200px]">
          <ChartContainer config={chartConfig} className="w-full h-[200px]">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                outerRadius={80}
                strokeWidth={4}
                stroke="#fff"
                paddingAngle={0}
              >
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy - 4}
                            className="fill-slate-900 text-2xl font-semibold"
                          >
                            {totalInvoices}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 16}
                            className="fill-slate-500 text-[10px] font-bold uppercase tracking-widest"
                          >
                            Faturas
                          </tspan>
                        </text>
                      )
                    }
                  }}
                />
              </Pie>
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            </PieChart>
          </ChartContainer>
        </div>

        <div className="mt-4 flex flex-col gap-2 px-2">
          {chartData.map((item) => (
            <div key={item.name} className="flex items-center justify-between text-[13px] font-medium text-slate-600">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.fill }} />
                <span>{item.name}</span>
              </div>
              <span className="font-bold text-slate-800">{item.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
