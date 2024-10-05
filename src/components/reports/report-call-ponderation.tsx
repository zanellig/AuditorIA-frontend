"use client"

import React from "react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { cn } from "@/lib/utils"

const chartData = [
  { idllamado: 14426759, ponderacion: 96 },
  { idllamado: 14427189, ponderacion: 95 },
  { idllamado: 14427492, ponderacion: 90 },
  { idllamado: 14427617, ponderacion: 33 },
  { idllamado: 14427670, ponderacion: 45 },
  { idllamado: 14427786, ponderacion: 56 },
  { idllamado: 14430223, ponderacion: 80 },
  { idllamado: 14430804, ponderacion: 72 },
  { idllamado: 14431153, ponderacion: 88 },
  { idllamado: 14431462, ponderacion: 92 },
  { idllamado: 14432085, ponderacion: 78 },
  { idllamado: 14432831, ponderacion: 66 },
  { idllamado: 14433684, ponderacion: 54 },
  { idllamado: 14436145, ponderacion: 85 },
  { idllamado: 14438870, ponderacion: 91 },
  { idllamado: 14438890, ponderacion: 64 },
  { idllamado: 14438928, ponderacion: 77 },
]

const chartConfig = {
  ponderacion: {
    label: "Ponderación",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

export function Component({ className }: { className?: string }) {
  return (
    <Card className={cn(className)}>
      <CardHeader className='flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row'>
        <div className='flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6'>
          <CardTitle>Ponderacion Calidad por llamado</CardTitle>
          <CardDescription>
            Mostrando la ponderacion de calidad por cada uno de los llamados
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className='px-2 sm:p-6'>
        <ChartContainer
          config={chartConfig}
          className='aspect-auto h-[250px] w-full'
        >
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey='idllamado'
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className='w-[150px]'
                  nameKey='ponderacion'
                  labelFormatter={value => `ID Llamado: ${value}`}
                />
              }
            />
            <Bar dataKey='ponderacion' fill={`var(--color-ponderacion)`} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
