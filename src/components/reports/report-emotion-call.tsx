"use client"

import { TrendingUp } from "lucide-react"
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
const chartData = [
  { emotion: "Alegría", Operador: 68, Cliente: 80 },
  { emotion: "Enojo", Operador: 56, Cliente: 34 },
  { emotion: "Miedo", Operador: 96, Cliente: 2 },
  { emotion: "Disgusto", Operador: 4, Cliente: 70 },
  { emotion: "Tristeza", Operador: 0, Cliente: 21 },
  { emotion: "Sorpresa", Operador: 77, Cliente: 80 },
]

const chartConfig = {
  Operador: {
    label: "Operador",
    color: "var(--chart-1)",
  },
  Cliente: {
    label: "Cliente",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig

export function ReportEmotionCall() {
  return (
    <Card>
      <CardHeader className='items-center pb-4'>
        <CardTitle>Promedio de emociones por llamada</CardTitle>
        <CardDescription>
          Mostrando el promedio de emociones por llamada
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className='mx-auto aspect-square h-full'
        >
          <RadarChart
            data={chartData}
            margin={{
              top: -40,
              bottom: -10,
            }}
          >
            <ChartTooltip
              cursor={true}
              content={<ChartTooltipContent indicator='line' />}
            />
            <PolarAngleAxis dataKey='emotion' />
            <PolarGrid />
            <Radar dataKey='Cliente' fill='var(--color-Cliente)' />
            <Radar
              dataKey='Operador'
              fill='var(--color-Operador)'
              fillOpacity={0.6}
            />
            <ChartLegend className='mt-8' content={<ChartLegendContent />} />
          </RadarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className='flex-col gap-2 pt-4 text-sm'>
        <div className='flex items-center gap-2 font-medium leading-none'>
          La emocion alegría fue un 5% superior a la media
          <TrendingUp className='h-4 w-4' />
        </div>
      </CardFooter>
    </Card>
  )
}
