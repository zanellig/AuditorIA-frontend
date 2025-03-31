"use client"

import { useState, useEffect } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertCircle,
  CheckCircle2,
  Filter,
  Loader2,
  Save,
  Search,
  Sparkles,
  XCircle,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

import { GLOBAL_ICON_SIZE } from "@/lib/consts"
import { cn } from "@/lib/utils"
import { useSearchParams } from "next/navigation"
import { useAudit } from "@/lib/hooks/use-audit"

interface AuditItem {
  category: string
  question: string
  complies: boolean
  explanation: string
}

interface AuditData {
  is_audit_failure: 0 | 1
  score: number
  audit: AuditItem[]
}

const auditingPhrases = [
  "Analizando la calidad del operador con inteligencia artificial...",
  "Evaluando cumplimiento de protocolos y estándares del llamado...",
  "Procesando las interacciones para detectar oportunidades de mejora...",
  "Identificando puntos fuertes y áreas de desarrollo en la atención...",
  "Generando reportes detallados basados en métricas de calidad...",
  "Esto puede tardar unos minutos...",
  "Por favor, espere un momento...",
  "Buscando errores críticos...",
  "Revisando la calidad del operador...",
  "Generando gráficos y tablas...",
  "Analizando los datos...",
  "Generando conclusiones...",
  "Generando informes...",
]

export default function OperatorQualityDashboard() {
  const search = useSearchParams()
  const uuid = search.get("identifier")
  const [enableQuery, setEnableQuery] = useState(false)
  const query = useAudit({ uuid: uuid ?? "", enabled: enableQuery })
  const auditData: AuditData | undefined = query.data
  const [filteredAudit, setFilteredAudit] = useState<AuditItem[]>([])
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [complianceFilter, setComplianceFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [editingItem, setEditingItem] = useState<number | null>(null)
  const [auditingPhraseIndex, setAuditingPhraseIndex] = useState(0)
  const [editFormData, setEditFormData] = useState<AuditItem>({
    category: "",
    question: "",
    complies: true,
    explanation: "",
  })

  // Update phrase every 5 seconds
  useEffect(() => {
    if (!query.isLoading) return

    const interval = setInterval(() => {
      setAuditingPhraseIndex(Math.floor(Math.random() * auditingPhrases.length))
    }, 5000)

    return () => clearInterval(interval)
  }, [query.isLoading])

  // Calculate metrics based on current audit data
  const totalItems = auditData?.audit?.length || 0
  const compliantItems =
    auditData?.audit?.filter(item => item.complies).length || 0
  const nonCompliantItems = totalItems - compliantItems
  const complianceRate =
    totalItems > 0 ? (compliantItems / totalItems) * 100 : 0

  // Get unique categories
  const categories = auditData?.audit
    ? [...new Set(auditData.audit.map(item => item.category))]
    : []

  // Calculate compliance by category
  const categoryCompliance = categories.map(category => {
    const categoryItems =
      auditData?.audit?.filter(item => item.category === category) || []
    const compliantCategoryItems = categoryItems.filter(
      item => item.complies
    ).length
    const compliancePercentage =
      (compliantCategoryItems / categoryItems.length) * 100

    return {
      name: category,
      compliance: compliancePercentage,
      total: categoryItems.length,
      compliant: compliantCategoryItems,
      nonCompliant: categoryItems.length - compliantCategoryItems,
    }
  })

  // Pie chart data
  const pieData = [
    { name: "Cumple", value: compliantItems, color: "#10b981" },
    { name: "No Cumple", value: nonCompliantItems, color: "#ef4444" },
  ]

  // Apply filters
  useEffect(() => {
    if (!auditData?.audit) return

    let filtered = auditData.audit

    if (categoryFilter !== "all") {
      filtered = filtered.filter(item => item.category === categoryFilter)
    }

    if (complianceFilter !== "all") {
      const isCompliant = complianceFilter === "compliant"
      filtered = filtered.filter(item => item.complies === isCompliant)
    }

    if (searchTerm) {
      filtered = filtered.filter(
        item =>
          item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.explanation.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredAudit(filtered)
  }, [categoryFilter, complianceFilter, searchTerm, auditData])

  // Calculate overall score
  const calculateScore = (): { is_audit_failure: 0 | 1; score: number } => {
    if (!auditData?.audit) {
      return { is_audit_failure: 0, score: 0 }
    }

    // Check if there are any critical errors (Error Critico category with complies: false)
    const hasCriticalErrors = auditData.audit.some(
      item => item.category === "Error Critico" && !item.complies
    )

    // If there are critical errors, the audit is a failure with score 0
    if (hasCriticalErrors) {
      return { is_audit_failure: 1, score: 0 }
    }

    // Otherwise, calculate score based on compliance percentage
    return {
      is_audit_failure: 0,
      score: Math.round(complianceRate),
    }
  }

  // Handle editing an item
  const handleEdit = (item: AuditItem, index: number): void => {
    setEditingItem(index)
    setEditFormData({
      category: item.category,
      question: item.question,
      complies: item.complies,
      explanation: item.explanation,
    })
  }

  // Handle saving edited item
  const handleSaveEdit = (): void => {
    if (editingItem === null || !auditData?.audit) return

    const updatedAudit = [...auditData.audit]
    updatedAudit[editingItem] = {
      ...editFormData,
    }

    setEditingItem(null)
  }

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target
    setEditFormData({
      ...editFormData,
      [name]: value,
    })
  }

  // Handle compliance toggle
  const handleComplianceChange = (value: boolean): void => {
    setEditFormData({
      ...editFormData,
      complies: value,
    })
  }

  // Reset filters
  const resetFilters = (): void => {
    setCategoryFilter("all")
    setComplianceFilter("all")
    setSearchTerm("")
  }

  return (
    <Accordion type='single' collapsible className='m-0'>
      <AccordionItem value='audit'>
        <AccordionTrigger
          className='flex gap-2 justify-start items-center'
          onClick={() => {
            setEnableQuery(true)
          }}
        >
          <Sparkles className='animate-sparkle' size={GLOBAL_ICON_SIZE} />
          <span>Obtener auditoría</span>
        </AccordionTrigger>
        <AccordionContent>
          {query.isLoading && (
            <div className='flex justify-center items-center py-12 flex-col gap-4'>
              <Sparkles
                className='animate-sparkle'
                size={GLOBAL_ICON_SIZE * 2}
              />
              <AnimatePresence mode='wait'>
                <motion.div
                  key={auditingPhraseIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className='text-center max-w-md'
                >
                  <p className='text-lg font-medium'>
                    {auditingPhrases[auditingPhraseIndex]}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
          )}

          {query.error && (
            <div className='p-4 text-red-500'>
              Error al cargar la auditoría: {(query.error as Error).message}
            </div>
          )}

          {!query.isLoading && !query.error && auditData?.audit && (
            <>
              {/* Summary Cards */}
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
                <Card
                  className={
                    auditData.is_audit_failure
                      ? "border-red-500"
                      : "border-green-500"
                  }
                >
                  <CardHeader className='pb-2'>
                    <CardTitle className='text-lg'>
                      Estado de Auditoría
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className='flex items-center'>
                      {auditData.is_audit_failure ? (
                        <AlertCircle className='h-8 w-8 text-red-500 mr-2' />
                      ) : (
                        <CheckCircle2 className='h-8 w-8 text-green-500 mr-2' />
                      )}
                      <div>
                        <p className='text-2xl font-bold'>
                          {auditData.is_audit_failure ? "Fallida" : "Aprobada"}
                        </p>
                        <p className='text-sm text-muted-foreground'>
                          {auditData.is_audit_failure
                            ? "Errores críticos detectados"
                            : "Sin errores críticos"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className='pb-2'>
                    <CardTitle className='text-lg'>
                      Puntuación General
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className='flex items-center'>
                      <div
                        className={cn(
                          "w-16 h-16 rounded-full flex items-center justify-center mr-4 bg-secondary"
                        )}
                      >
                        <span className='text-lg font-bold'>
                          {auditData.score}%
                        </span>
                      </div>
                      <div>
                        <p className='text-sm text-muted-foreground'>
                          Basado en {totalItems} elementos de auditoría
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className='pb-2'>
                    <CardTitle className='text-lg'>
                      Tasa de Cumplimiento
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className='flex items-center'>
                      <div className='w-full'>
                        <div className='flex justify-between mb-1'>
                          <span className='text-sm'>
                            {compliantItems} Cumple
                          </span>
                          <span className='text-sm'>
                            {nonCompliantItems} No Cumple
                          </span>
                        </div>
                        <div className='w-full bg-gray-200 rounded-full h-2.5'>
                          <div
                            className='bg-green-500 h-2.5 rounded-full'
                            style={{ width: `${complianceRate}%` }}
                          ></div>
                        </div>
                        <p className='text-sm text-muted-foreground mt-2'>
                          {complianceRate.toFixed(1)}% tasa de cumplimiento
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className='pb-2'>
                    <CardTitle className='text-lg'>Errores Críticos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className='flex items-center'>
                      <XCircle className='h-8 w-8 text-red-500 mr-2' />
                      <div>
                        <p className='text-2xl font-bold'>
                          {
                            auditData.audit.filter(
                              item =>
                                item.category === "Error Critico" &&
                                !item.complies
                            ).length
                          }
                        </p>
                        <p className='text-sm text-muted-foreground'>
                          Problemas críticos de cumplimiento
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Tabs defaultValue='table' className='mb-6'>
                <TabsList>
                  <TabsTrigger value='table'>Vista de Tabla</TabsTrigger>
                  <TabsTrigger value='charts'>Gráficos</TabsTrigger>
                </TabsList>

                <TabsContent value='table'>
                  {/* Filters */}
                  <div className='flex flex-col md:flex-row gap-4 mb-4'>
                    <div className='flex-1'>
                      <div className='relative'>
                        <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
                        <Input
                          placeholder='Buscar preguntas o explicaciones...'
                          className='pl-8'
                          value={searchTerm}
                          onChange={e => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>

                    <Select
                      value={categoryFilter}
                      onValueChange={setCategoryFilter}
                    >
                      <SelectTrigger className='w-[180px]'>
                        <SelectValue placeholder='Filtrar por categoría' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='all'>
                          Todas las Categorías
                        </SelectItem>
                        {categories.map((category, idx) => (
                          <SelectItem
                            key={`category-${idx}`}
                            value={category as string}
                          >
                            {category as string}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={complianceFilter}
                      onValueChange={setComplianceFilter}
                    >
                      <SelectTrigger className='w-[180px]'>
                        <SelectValue placeholder='Filtrar por cumplimiento' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='all'>Todo Cumplimiento</SelectItem>
                        <SelectItem value='compliant'>Cumple</SelectItem>
                        <SelectItem value='non-compliant'>No Cumple</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button variant='outline' onClick={resetFilters}>
                      <Filter className='h-4 w-4 mr-2' />
                      Reiniciar Filtros
                    </Button>
                  </div>

                  {/* Audit Table */}
                  <div className='rounded-md border'>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className='w-[200px]'>Categoría</TableHead>
                          <TableHead>Pregunta</TableHead>
                          <TableHead className='w-[100px] text-center'>
                            Cumple
                          </TableHead>
                          <TableHead className='w-[300px]'>
                            Explicación
                          </TableHead>
                          <TableHead className='w-[100px] text-right'>
                            Acciones
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredAudit.map((item, index) => (
                          <TableRow key={index}>
                            {editingItem === index ? (
                              <>
                                <TableCell>
                                  <Select
                                    value={editFormData.category}
                                    onValueChange={value =>
                                      setEditFormData({
                                        ...editFormData,
                                        category: value,
                                      })
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder='Select category' />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {categories.map((category, idx) => (
                                        <SelectItem
                                          key={`edit-cat-${idx}`}
                                          value={category as string}
                                        >
                                          {category as string}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </TableCell>
                                <TableCell>
                                  <Input
                                    name='question'
                                    value={editFormData.question}
                                    onChange={handleInputChange}
                                  />
                                </TableCell>
                                <TableCell className='text-center'>
                                  <Switch
                                    checked={editFormData.complies}
                                    onCheckedChange={handleComplianceChange}
                                  />
                                </TableCell>
                                <TableCell>
                                  <Input
                                    name='explanation'
                                    value={editFormData.explanation}
                                    onChange={handleInputChange}
                                  />
                                </TableCell>
                                <TableCell className='text-right'>
                                  <Button size='sm' onClick={handleSaveEdit}>
                                    <Save className='h-4 w-4 mr-1' />
                                    Guardar
                                  </Button>
                                </TableCell>
                              </>
                            ) : (
                              <>
                                <TableCell>
                                  <Badge variant='outline'>
                                    {item.category}
                                  </Badge>
                                </TableCell>
                                <TableCell>{item.question}</TableCell>
                                <TableCell className='text-center'>
                                  {item.complies ? (
                                    <Badge className='bg-green-500'>Sí</Badge>
                                  ) : (
                                    <Badge variant='destructive'>No</Badge>
                                  )}
                                </TableCell>
                                <TableCell className='text-sm'>
                                  {item.explanation}
                                </TableCell>
                                <TableCell className='text-right'>
                                  <Button
                                    variant='ghost'
                                    size='sm'
                                    onClick={() => handleEdit(item, index)}
                                  >
                                    Editar
                                  </Button>
                                </TableCell>
                              </>
                            )}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                <TabsContent value='charts'>
                  <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                    {/* Pie Chart */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Cumplimiento General</CardTitle>
                        <CardDescription>
                          Distribución de elementos que cumplen vs no cumplen
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className='h-[300px]'>
                          <ResponsiveContainer width='100%' height='100%'>
                            <PieChart>
                              <Pie
                                data={pieData}
                                cx='50%'
                                cy='50%'
                                labelLine={false}
                                outerRadius={100}
                                fill='#8884d8'
                                dataKey='value'
                                label={({ name, percent }) => {
                                  const translatedName =
                                    name === "Cumple" ? "Cumple" : "No Cumple"
                                  return `${translatedName} ${(percent * 100).toFixed(0)}%`
                                }}
                              >
                                {pieData.map((entry, index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={entry.color}
                                  />
                                ))}
                              </Pie>
                              <Tooltip />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Bar Chart */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Cumplimiento por Categoría</CardTitle>
                        <CardDescription>
                          Porcentaje de elementos que cumplen en cada categoría
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className='h-[300px]'>
                          <ResponsiveContainer width='100%' height='100%'>
                            <BarChart
                              data={categoryCompliance}
                              layout='vertical'
                              margin={{
                                top: 5,
                                right: 30,
                                left: 20,
                                bottom: 5,
                              }}
                            >
                              <CartesianGrid strokeDasharray='3 3' />
                              <XAxis type='number' domain={[0, 100]} />
                              <YAxis
                                type='category'
                                dataKey='name'
                                width={120}
                                tick={{ fontSize: 12 }}
                              />
                              <Tooltip
                                formatter={(value: number | string) => {
                                  if (typeof value === "number") {
                                    return [
                                      `${value.toFixed(1)}%`,
                                      "Cumplimiento",
                                    ]
                                  }
                                  return [value, "Cumplimiento"]
                                }}
                                labelFormatter={value => `Categoría: ${value}`}
                              />
                              <Bar
                                dataKey='compliance'
                                fill='#10b981'
                                radius={[0, 4, 4, 0]}
                              >
                                {categoryCompliance.map((entry, index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={
                                      entry.compliance < 70
                                        ? "#ef4444"
                                        : entry.compliance < 90
                                          ? "#f59e0b"
                                          : "#10b981"
                                    }
                                  />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Category Details */}
                    <Card className='lg:col-span-2'>
                      <CardHeader>
                        <CardTitle>Detalles por Categoría</CardTitle>
                        <CardDescription>
                          Desglose detallado de cumplimiento por categoría
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                          {categoryCompliance.map((category, index) => (
                            <div
                              key={index}
                              className='border rounded-lg p-4 flex flex-col'
                            >
                              <h3 className='font-medium mb-2'>
                                {category.name}
                              </h3>
                              <div className='flex justify-between text-sm mb-1'>
                                <span>{category.compliant} Cumple</span>
                                <span>{category.nonCompliant} No Cumple</span>
                              </div>
                              <div className='w-full bg-gray-200 rounded-full h-2 mb-3'>
                                <div
                                  className={`h-2 rounded-full ${
                                    category.compliance < 70
                                      ? "bg-red-500"
                                      : category.compliance < 90
                                        ? "bg-amber-500"
                                        : "bg-green-500"
                                  }`}
                                  style={{ width: `${category.compliance}%` }}
                                ></div>
                              </div>
                              <div className='mt-auto'>
                                <Badge
                                  className={`${
                                    category.compliance < 70
                                      ? "bg-red-500"
                                      : category.compliance < 90
                                        ? "bg-amber-500"
                                        : "bg-green-500"
                                  }`}
                                >
                                  {category.compliance.toFixed(1)}%
                                </Badge>
                                <span className='text-xs text-muted-foreground ml-2'>
                                  {category.total} elementos
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
