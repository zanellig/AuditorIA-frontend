"use client"

import { useState, useMemo } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
} from "recharts"
import { cn, normalizeString } from "@/lib/utils"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"
import { GLOBAL_ICON_SIZE } from "@/lib/consts"
import { useToast } from "@/components/ui/use-toast"
import PulsingDot from "@/components/pulsing-dot"

type DashboardProps = {
  initialData: Record<string, string>
}

export function PerformanceDashboard({ initialData }: DashboardProps) {
  const [data, setData] = useState(initialData)
  const [showErrorCard, setShowErrorCard] = useState(false)
  const { toast } = useToast()

  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884D8",
    "#82CA9D",
    "#A4DE6C",
    "#D0ED57",
  ]

  const categories = useMemo(() => {
    return Object.keys(data).reduce((acc, key) => {
      if (key !== "PUNTAJE TOTAL") {
        const category = key.split(" - ")[0].trim()
        if (!acc.includes(category)) {
          acc.push(category)
        }
      }
      return acc
    }, [] as string[])
  }, [data])

  const criticalErrors = useMemo(() => {
    return Object.entries(data).filter(([key, value]) => {
      const normalizedKey = normalizeString(key).toLocaleLowerCase()
      return normalizedKey.includes("error") && Number(value) > 0
    })
  }, [data])

  const isAuditFailure = useMemo(() => {
    const criticalErrorsCount = criticalErrors.length
    return Number(data["PUNTAJE TOTAL"]) < 75 || criticalErrorsCount !== 0
  }, [data])

  const chartData = useMemo(() => {
    return categories.map(category => ({
      name: category,
      value: Object.entries(data)
        .filter(([key]) => key.startsWith(category) && key !== "PUNTAJE TOTAL")
        .reduce((sum, [, value]) => sum + Number(value), 0),
      fill: COLORS[categories.indexOf(category) % COLORS.length],
    }))
  }, [categories, data])

  const handleInputChange = (key: string, value: string) => {
    if (key === "PUNTAJE TOTAL") {
      return toast({
        title: "Valor no permitido",
        description: "El valor del puntaje total no puede ser modificado",
        variant: "destructive",
      })
    }
    if (value === "") {
      setData(prevData => ({ ...prevData, [key]: "0" }))
    }
    if (Number(value) > 10) {
      return toast({
        title: "Valor máximo excedido",
        description: "El valor máximo permitido es 10",
        variant: "destructive",
      })
    }
    if (Number(value) < 0) {
      return toast({
        title: "Valor mínimo excedido",
        description: "El valor mínimo permitido es 0",
        variant: "destructive",
      })
    }
    setData(prevData => ({ ...prevData, [key]: value }))
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Card className='p-0'>
          <CardContent className='p-2'>
            <div className='text-sm'>
              <span>{payload[0].name}: </span>
              <span className='font-bold'>{payload[0].value}</span>
            </div>
          </CardContent>
        </Card>
      )
    }
    return null
  }

  return (
    <Card className='w-full max-w-7xl mx-auto'>
      <CardHeader>
        <CardTitle>Performance del llamado</CardTitle>
        <CardDescription>
          Vea y edite las métricas del llamado generadas por IA
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue='overview' className='space-y-4'>
          <TabsList>
            <TabsTrigger value='overview'>Vista general</TabsTrigger>
            <TabsTrigger value='details'>Detalles</TabsTrigger>
          </TabsList>
          <TabsContent value='overview' className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <Card className='bg-muted'>
                <CardHeader>
                  <CardTitle>Rendimiento por categoría</CardTitle>
                </CardHeader>
                <CardContent className='h-[300px]'>
                  <ResponsiveContainer width='100%' height='100%'>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray='3 3' />
                      <XAxis
                        dataKey='name'
                        interval={0}
                        angle={-45}
                        textAnchor='end'
                        height={70}
                        tick={{ fontSize: 10 }}
                        padding={"gap"}
                      />
                      <YAxis />
                      <Bar dataKey='value' fill='#8884d8' />
                      <Tooltip content={CustomTooltip} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card className='bg-muted'>
                <CardHeader>
                  <CardTitle>Distribución del rendimiento</CardTitle>
                </CardHeader>
                <CardContent className='h-[300px]'>
                  <ResponsiveContainer width='100%' height='100%'>
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx='50%'
                        cy='50%'
                        labelLine={false}
                        outerRadius={80}
                        fill='#8884d8'
                        dataKey='value'
                      >
                        {chartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={CustomTooltip} />
                      <Legend className='text-sm' />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <Card
                className={cn(
                  isAuditFailure ? "bg-destructive" : "bg-success",
                  "text-white h-fit"
                )}
              >
                <CardHeader>
                  <CardTitle>Puntaje final</CardTitle>
                </CardHeader>
                <CardContent className='flex gap-2 items-center'>
                  <div className='text-4xl font-bold'>
                    {data["PUNTAJE TOTAL"]}
                  </div>
                </CardContent>
                <CardFooter>
                  {isAuditFailure ? (
                    <Button
                      className='flex gap-2 bg-foreground'
                      size='sm'
                      onClick={() => setShowErrorCard(true)}
                    >
                      <ArrowRight size={GLOBAL_ICON_SIZE} />
                      <span>Revisar puntos de mejora</span>
                    </Button>
                  ) : (
                    <div>
                      ¡Felicitaciones! No se han detectado errores en el
                      llamado.
                    </div>
                  )}
                </CardFooter>
              </Card>
              {showErrorCard && <ErrorCard errors={criticalErrors} />}
            </div>
          </TabsContent>
          <TabsContent value='details'>
            <ScrollArea className='h-[600px] w-full rounded-md border p-4'>
              {Object.entries(data).map(([key, value]) => (
                <div key={key} className='mb-4'>
                  <Label htmlFor={key}>{key}</Label>
                  <Input
                    type='number'
                    id={key}
                    value={value}
                    onChange={e => handleInputChange(key, e.target.value)}
                  />
                </div>
              ))}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

const ProgressBar = ({ value }: { value: number }) => (
  <div className='w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-900'>
    <div
      className='bg-destructive h-2.5 rounded-full'
      style={{ width: `${(value / 10) * 100}%` }}
    ></div>
  </div>
)

function ErrorCard({ errors }: { errors: [string, string][] }) {
  return (
    <Card className='w-full max-w-2xl'>
      <CardHeader>
        <CardTitle>Errores críticos</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className='space-y-4'>
          {errors.map(([error, value]) => {
            const [errorType, errorDescription] = error.split(" - ")
            return (
              <li key={error} className='space-y-1'>
                <div className='flex justify-between items-center'>
                  <div className='flex gap-2 items-center'>
                    <span className='text-sm font-medium'>
                      {errorDescription}
                    </span>
                    {Number(value) >= 5 && (
                      <PulsingDot className='text-error' />
                    )}
                  </div>
                  <span className='text-sm font-medium'>{value}</span>
                </div>
                <ProgressBar value={parseInt(value)} />
              </li>
            )
          })}
        </ul>
      </CardContent>
      <CardFooter className='flex flex-col items-start gap-2'>
        <Button className='animate-sparkle' variant='secondary'>
          Proponer solución con IA
          <Sparkles size={GLOBAL_ICON_SIZE} className='ml-2' />
        </Button>
        <Button>
          Mostrar segmentos problemáticos
          <ArrowRight size={GLOBAL_ICON_SIZE} className='ml-2' />
        </Button>
      </CardFooter>
    </Card>
  )
}
