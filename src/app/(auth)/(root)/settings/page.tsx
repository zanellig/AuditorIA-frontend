"use client"
import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import TableContainer from "@/components/tables/table-core/table-container"
import TitleContainer from "@/components/title-container"
import { Settings } from "lucide-react"
import { TypographyH4 } from "@/components/typography/h4"
import { DASHBOARD_ICON_CLASSES } from "@/lib/consts"
import { StatefulButton } from "@/components/stateful-button"

// Define types for the state
interface AuditApiState {
  url: string
  enableSentimentAnalysis: boolean
  minSpeakers: number
  maxSpeakers: number
}

/* TODO: 
  Implement mutation
  Retrieve initial data from stored values
*/
interface WhisperApiState {
  url: string
  language: string
  task: string
  model: string
  device: string
  computeType: string
  batchSize: number
  beamSize: number
  patience: number
  lengthPenalty: number
  temperature: number
  compressionRatioThreshold: number
  logProbThreshold: number
  noSpeechThreshold: number
  vadOnset: number
  vadOffset: number
}

const initAuditAPIState = {
  url: "",
  enableSentimentAnalysis: false,
  minSpeakers: 1,
  maxSpeakers: 10,
} as const

const initWhisperAPIState = {
  url: "",
  language: "es",
  task: "transcribe",
  model: "large-v3",
  device: "cuda",
  computeType: "float16",
  batchSize: 8,
  beamSize: 5,
  patience: 1,
  lengthPenalty: 1,
  temperature: 0,
  compressionRatioThreshold: 2.4,
  logProbThreshold: -1,
  noSpeechThreshold: 0.6,
  vadOnset: 0.5,
  vadOffset: 0.363,
} as const

export default function AdminSettings() {
  // Audit API state
  const [auditApiState, setAuditApiState] =
    useState<AuditApiState>(initAuditAPIState)

  // Whisper API state
  const [whisperApiState, setWhisperApiState] =
    useState<WhisperApiState>(initWhisperAPIState)

  const setAuditApiUrl = (url: string) =>
    setAuditApiState(prevState => ({ ...prevState, url }))

  const setEnableSentimentAnalysis = (enableSentimentAnalysis: boolean) =>
    setAuditApiState(prevState => ({
      ...prevState,
      enableSentimentAnalysis,
    }))

  const setMinSpeakers = (minSpeakers: number) =>
    setAuditApiState(prevState => ({ ...prevState, minSpeakers }))

  const setMaxSpeakers = (maxSpeakers: number) =>
    setAuditApiState(prevState => ({ ...prevState, maxSpeakers }))

  const setWhisperApiUrl = (url: string) =>
    setWhisperApiState(prevState => ({ ...prevState, url }))

  const setLanguage = (language: string) =>
    setWhisperApiState(prevState => ({ ...prevState, language }))

  const setTask = (task: string) =>
    setWhisperApiState(prevState => ({ ...prevState, task }))

  const setModel = (model: string) =>
    setWhisperApiState(prevState => ({ ...prevState, model }))

  const setDevice = (device: string) =>
    setWhisperApiState(prevState => ({ ...prevState, device }))

  const setComputeType = (computeType: string) =>
    setWhisperApiState(prevState => ({ ...prevState, computeType }))

  const setBatchSize = (batchSize: number) =>
    setWhisperApiState(prevState => ({ ...prevState, batchSize }))

  const setBeamSize = (beamSize: number) =>
    setWhisperApiState(prevState => ({ ...prevState, beamSize }))

  const setPatience = (patience: number) =>
    setWhisperApiState(prevState => ({ ...prevState, patience }))

  const setLengthPenalty = (lengthPenalty: number) =>
    setWhisperApiState(prevState => ({ ...prevState, lengthPenalty }))

  const setTemperature = (temperature: number) =>
    setWhisperApiState(prevState => ({ ...prevState, temperature }))

  const setCompressionRatioThreshold = (compressionRatioThreshold: number) =>
    setWhisperApiState(prevState => ({
      ...prevState,
      compressionRatioThreshold,
    }))

  const setLogProbThreshold = (logProbThreshold: number) =>
    setWhisperApiState(prevState => ({ ...prevState, logProbThreshold }))

  const setNoSpeechThreshold = (noSpeechThreshold: number) =>
    setWhisperApiState(prevState => ({ ...prevState, noSpeechThreshold }))

  const setVadOnset = (vadOnset: number) =>
    setWhisperApiState(prevState => ({ ...prevState, vadOnset }))

  const setVadOffset = (vadOffset: number) =>
    setWhisperApiState(prevState => ({ ...prevState, vadOffset }))

  return (
    <main className='w-full h-full'>
      <TableContainer>
        <TitleContainer separate>
          <Settings className={DASHBOARD_ICON_CLASSES} />
          <TypographyH4>Configuración Administrativa</TypographyH4>
        </TitleContainer>
        <Tabs defaultValue='audit'>
          <TabsList className='grid w-full grid-cols-2'>
            <TabsTrigger value='audit'>API de Auditoría</TabsTrigger>
            <TabsTrigger value='whisper'>API de Whisper</TabsTrigger>
          </TabsList>
          <TabsContent value='audit'>
            <Card>
              <CardHeader>
                <CardTitle>Configuración de la API de Auditoría</CardTitle>
                <CardDescription>
                  Configure los ajustes para la API de Auditoría de Llamadas
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='auditApiUrl'>URL de la API</Label>
                  <Input
                    id='auditApiUrl'
                    placeholder='https://api.auditoria.linksolution.com.ar/audit'
                    value={auditApiState.url}
                    onChange={e => setAuditApiUrl(e.target.value)}
                  />
                </div>
                <div className='flex items-center space-x-2'>
                  <Switch
                    id='enableSentimentAnalysis'
                    checked={auditApiState.enableSentimentAnalysis}
                    onCheckedChange={setEnableSentimentAnalysis}
                  />
                  <Label htmlFor='enableSentimentAnalysis'>
                    Habilitar Análisis de Sentimientos
                  </Label>
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='minSpeakers'>
                    Cantidad Mínima de Hablantes
                  </Label>
                  <Input
                    id='minSpeakers'
                    type='number'
                    min={1}
                    max={auditApiState.maxSpeakers}
                    value={auditApiState.minSpeakers}
                    onChange={e => setMinSpeakers(Number(e.target.value))}
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='maxSpeakers'>
                    Cantidad Máxima de Hablantes
                  </Label>
                  <Input
                    id='maxSpeakers'
                    type='number'
                    min={auditApiState.minSpeakers}
                    value={auditApiState.maxSpeakers}
                    onChange={e => setMaxSpeakers(Number(e.target.value))}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value='whisper'>
            <Card>
              <CardHeader>
                <CardTitle>Configuración de la API de Whisper</CardTitle>
                <CardDescription>
                  Configure los ajustes para la API de Whisper para Texto a Voz
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='whisperApiUrl'>URL de la API</Label>
                  <Input
                    id='whisperApiUrl'
                    placeholder='https://api.auditoria.linksolution.com.ar/whisper'
                    value={whisperApiState.url}
                    onChange={e => setWhisperApiUrl(e.target.value)}
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='language'>Idioma Predeterminado</Label>
                  <Select
                    value={whisperApiState.language}
                    onValueChange={setLanguage}
                  >
                    <SelectTrigger id='language'>
                      <SelectValue placeholder='Seleccione un idioma' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='es'>Español</SelectItem>
                      <SelectItem value='en'>Inglés</SelectItem>
                      <SelectItem value='fr'>Francés</SelectItem>
                      {/* Añada más opciones de idioma según sea necesario */}
                    </SelectContent>
                  </Select>
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='task'>Tarea</Label>
                  <Select value={whisperApiState.task} onValueChange={setTask}>
                    <SelectTrigger id='task'>
                      <SelectValue placeholder='Seleccione una tarea' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='transcribe'>Transcripción</SelectItem>
                      <SelectItem value='translate'>Traducción</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='model'>Modelo de Whisper</Label>
                  <Select
                    value={whisperApiState.model}
                    onValueChange={setModel}
                  >
                    <SelectTrigger id='model'>
                      <SelectValue placeholder='Seleccione un modelo' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='tiny'>Tiny</SelectItem>
                      <SelectItem value='base'>Base</SelectItem>
                      <SelectItem value='small'>Small</SelectItem>
                      <SelectItem value='medium'>Medium</SelectItem>
                      <SelectItem value='large-v3'>Large v3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='device'>Dispositivo de Inferencia</Label>
                  <Select
                    value={whisperApiState.device}
                    onValueChange={setDevice}
                  >
                    <SelectTrigger id='device'>
                      <SelectValue placeholder='Seleccione un dispositivo' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='cuda'>CUDA (GPU)</SelectItem>
                      <SelectItem value='cpu'>CPU</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='computeType'>Tipo de Cómputo</Label>
                  <Select
                    value={whisperApiState.computeType}
                    onValueChange={setComputeType}
                  >
                    <SelectTrigger id='computeType'>
                      <SelectValue placeholder='Seleccione un tipo de cómputo' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='float16'>float16</SelectItem>
                      <SelectItem value='int8'>int8</SelectItem>
                      <SelectItem value='float32'>float32</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='batchSize'>Tamaño del Lote</Label>
                  <Input
                    id='batchSize'
                    type='number'
                    min={1}
                    value={whisperApiState.batchSize}
                    onChange={e => setBatchSize(Number(e.target.value))}
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='beamSize'>Tamaño del Haz</Label>
                  <Input
                    id='beamSize'
                    type='number'
                    min={1}
                    value={whisperApiState.beamSize}
                    onChange={e => setBeamSize(Number(e.target.value))}
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='patience'>Paciencia</Label>
                  <Input
                    id='patience'
                    type='number'
                    step={0.1}
                    min={0}
                    value={whisperApiState.patience}
                    onChange={e => setPatience(Number(e.target.value))}
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='lengthPenalty'>
                    Penalización por Longitud
                  </Label>
                  <Input
                    id='lengthPenalty'
                    type='number'
                    step={0.1}
                    min={0}
                    value={whisperApiState.lengthPenalty}
                    onChange={e => setLengthPenalty(Number(e.target.value))}
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='temperature'>Temperatura</Label>
                  <Slider
                    id='temperature'
                    min={0}
                    max={1}
                    step={0.1}
                    value={[whisperApiState.temperature]}
                    onValueChange={value => setTemperature(value[0])}
                  />
                  <div className='text-right text-sm text-muted-foreground'>
                    {whisperApiState.temperature.toFixed(1)}
                  </div>
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='compressionRatioThreshold'>
                    Umbral de Relación de Compresión
                  </Label>
                  <Input
                    id='compressionRatioThreshold'
                    type='number'
                    step={0.1}
                    min={0}
                    value={whisperApiState.compressionRatioThreshold}
                    onChange={e =>
                      setCompressionRatioThreshold(Number(e.target.value))
                    }
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='logProbThreshold'>
                    Umbral de Probabilidad Logarítmica
                  </Label>
                  <Input
                    id='logProbThreshold'
                    type='number'
                    step={0.1}
                    value={whisperApiState.logProbThreshold}
                    onChange={e => setLogProbThreshold(Number(e.target.value))}
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='noSpeechThreshold'>Umbral de No Voz</Label>
                  <Slider
                    id='noSpeechThreshold'
                    min={0}
                    max={1}
                    step={0.01}
                    value={[whisperApiState.noSpeechThreshold]}
                    onValueChange={value => setNoSpeechThreshold(value[0])}
                  />
                  <div className='text-right text-sm text-muted-foreground'>
                    {whisperApiState.noSpeechThreshold.toFixed(2)}
                  </div>
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='vadOnset'>Inicio de VAD</Label>
                  <Slider
                    id='vadOnset'
                    min={0}
                    max={1}
                    step={0.01}
                    value={[whisperApiState.vadOnset]}
                    onValueChange={value => setVadOnset(value[0])}
                  />
                  <div className='text-right text-sm text-muted-foreground'>
                    {whisperApiState.vadOnset.toFixed(2)}
                  </div>
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='vadOffset'>Fin de VAD</Label>
                  <Slider
                    id='vadOffset'
                    min={0}
                    max={1}
                    step={0.001}
                    value={[whisperApiState.vadOffset]}
                    onValueChange={value => setVadOffset(value[0])}
                  />
                  <div className='text-right text-sm text-muted-foreground'>
                    {whisperApiState.vadOffset.toFixed(3)}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        <StatefulButton
          className='mt-2'
          disabled={
            initAuditAPIState === auditApiState &&
            initWhisperAPIState === whisperApiState
          }
        >
          Guardar cambios
        </StatefulButton>
      </TableContainer>
    </main>
  )
}
