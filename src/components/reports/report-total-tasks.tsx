"use client"

import { TrendingUp } from "lucide-react"
import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ChartConfig, ChartContainer } from "@/components/ui/chart"

// Datos actualizados para "tasks"
const chartData = [{ name: "Tasks", tasks: 52, fill: "var(--chart-2)" }]

const chartConfig = {
  tasks: {
    label: "Tasks",
  },
  RecordingsTable: {
    label: "Safari",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

export function Components() {
  return (
    <Card className='flex flex-col'>
      <CardHeader className='items-center pb-0'>
        <CardTitle>Cantidad de tareas enviadas</CardTitle>
        <CardDescription>
          Mostrando la cantidad de tareas enviadas del ultimo mes
        </CardDescription>
      </CardHeader>
      <CardContent className='flex-1 pb-0'>
        <ChartContainer
          config={chartConfig}
          className='mx-auto aspect-square max-h-[250px]'
        >
          <RadialBarChart
            data={chartData}
            endAngle={100}
            innerRadius={80}
            outerRadius={140}
          >
            <PolarGrid
              gridType='circle'
              radialLines={false}
              stroke='none'
              className='first:fill-muted last:fill-background'
              polarRadius={[86, 74]}
            />
            <RadialBar dataKey='tasks' background />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor='middle'
                        dominantBaseline='middle'
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className='fill-foreground text-4xl font-bold'
                        >
                          {chartData[0].tasks.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className='fill-muted-foreground'
                        >
                          Tasks
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </PolarRadiusAxis>
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className='flex-col gap-2 text-sm'>
        <div className='flex items-center gap-2 font-medium leading-none'>
          La cantidad de tareas enviadas fue un 120% superior a la media del
          ultimo mes <TrendingUp className='h-4 w-4' />
        </div>
      </CardFooter>
    </Card>
  )
}
