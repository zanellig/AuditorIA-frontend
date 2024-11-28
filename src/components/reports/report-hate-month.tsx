"use client"
import React from "react"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { CartesianGrid, Line, LineChart, XAxis } from "recharts"
import { getLocaleMonth } from "@/lib/utils"

// audios problematicos por mes (generales)
const chartData = [
  {
    month: 0,
    total_hate: 7,
    total_negative: 13,
  },
  {
    month: 1,
    total_hate: 19,
    total_negative: 21,
  },
  {
    month: 2,
    total_hate: 12,
    total_negative: 15,
  },
  {
    month: 3,
    total_hate: 1,
    total_negative: 8,
  },
  {
    month: 4,
    total_hate: 0,
    total_negative: 2,
  },
  {
    month: 5,
    total_hate: 29,
    total_negative: 43,
  },
  {
    month: 6,
    total_hate: 0,
    total_negative: 0,
  },
]

const chartConfig = {
  month: {
    label: "Audios",
  },
  total_hate: {
    label: "Discurso de odio",
    color: "var(--chart-3)",
  },
  total_negative: {
    label: "Negatividad",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig

export default function ReportHateMonth() {
  const [activeChart, setActiveChart] =
    React.useState<keyof typeof chartConfig>("total_hate")
  const total = React.useMemo(
    () => ({
      total_hate: chartData.reduce((acc, curr) => acc + curr["total_hate"], 0),
      total_negative: chartData.reduce(
        (acc, curr) => acc + curr["total_negative"],
        0
      ),
    }),
    []
  )
  return (
    <>
      <Card className='w-full'>
        <CardHeader className='flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row'>
          <div className='flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6'>
            <CardTitle>Audios problemáticos por mes</CardTitle>
            <CardDescription>
              Mostrando audios del último mes analizados con una alta
              probabilidad de contener discurso negativo
            </CardDescription>
          </div>
          <div className='flex'>
            {["total_hate", "total_negative"].map(key => {
              const chart = key as keyof typeof chartConfig
              return (
                <button
                  key={chart}
                  data-active={activeChart === chart}
                  className='flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6'
                  onClick={() => setActiveChart(chart)}
                >
                  <span className='text-xs text-muted-foreground'>
                    {chartConfig[chart].label}
                  </span>
                  <span className='text-lg font-bold leading-none sm:text-3xl'>
                    {total[key as keyof typeof total].toLocaleString()}
                  </span>
                </button>
              )
            })}
          </div>
        </CardHeader>
        <CardContent className='px-2 sm:p-6'>
          <ChartContainer
            config={chartConfig}
            className='aspect-auto h-[250px] w-full'
          >
            <LineChart
              accessibilityLayer
              data={chartData}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid
                vertical={false}
                // fillOpacity={0.3}
                // fill='var(--color-muted)'
              />
              <XAxis
                dataKey='month'
                tickLine={true}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={value => {
                  return getLocaleMonth(value)
                }}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    className='w-[150px]'
                    nameKey='month'
                    labelFormatter={value => {
                      return value.toLocaleString()
                    }}
                    cursor={true}
                  />
                }
              />
              <Line
                dataKey={activeChart}
                type='monotone'
                stroke={`var(--color-${activeChart})`}
                strokeWidth={3}
                dot={true}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </>
  )
}
