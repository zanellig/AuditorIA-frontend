"use client"

import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Cpu,
  HardDrive,
  Clock,
  FileAudio,
  Languages,
  Settings,
  Zap,
  Users,
} from "lucide-react"
import type { ITranscription } from "@/lib/types"
import { formatTimestamp, secondsToHMS } from "@/lib/utils"
import m from "@/lib/locales"

interface IMetadataDisplayProps {
  metadata: ITranscription["metadata"]
}

const MetadataDisplay: React.FC<IMetadataDisplayProps> = ({
  metadata,
}: IMetadataDisplayProps) => {
  const languageName = m.getLanguageName(metadata.language, { locale: "es" })
  return (
    <>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-4 md:mb-6'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Tipo de tarea</CardTitle>
            <Settings className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-l md:text-xl font-bold truncate'>
              {metadata.task_params.task}
            </div>
            <p className='text-xs text-muted-foreground'>
              Transcripción de proceso completo
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Modelo</CardTitle>
            <Cpu className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-l md:text-xl font-bold truncate'>
              {metadata.task_params.model}
            </div>
            <p className='text-xs text-muted-foreground'>
              Modelo avanzado de transcripción
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Idioma</CardTitle>
            <Languages className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-l md:text-xl font-bold truncate'>
              {metadata.language.toUpperCase()}
            </div>
            <p className='text-xs text-muted-foreground'>{languageName}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Dispositivo</CardTitle>
            <HardDrive className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-l md:text-xl font-bold truncate'>
              {metadata.task_params.device?.toUpperCase() || "-"}
            </div>
            <p className='text-xs text-muted-foreground'>
              Dispositivo de procesamiento
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Tipo de cómputo
            </CardTitle>
            <Zap className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-l md:text-xl font-bold truncate'>
              {metadata.task_params.compute_type}
            </div>
            <p className='text-xs text-muted-foreground'>
              Tipo de cálculo utilizado
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Tamaño de lote
            </CardTitle>
            <Users className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-l md:text-xl font-bold truncate'>
              {metadata.task_params.batch_size}
            </div>
            <p className='text-xs text-muted-foreground'>
              Número de muestras procesadas simultáneamente
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className='mb-4 md:mb-6'>
        <CardHeader>
          <CardTitle className='text-lg md:text-xl'>
            Información del archivo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 mb-4'>
            <FileAudio className='h-6 w-6 text-primary' />
            <div className='flex-1 min-w-0'>
              <p className='text-sm font-medium truncate'>Nombre del archivo</p>
              <p className='text-xs text-muted-foreground truncate'>
                {metadata.file_name}
              </p>
            </div>
          </div>
          <div className='flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4'>
            <Clock className='h-6 w-6 text-primary' />
            <div className='flex-1 min-w-0'>
              <p className='text-sm font-medium'>Duración</p>
              <p className='text-xs text-muted-foreground'>
                {formatTimestamp(secondsToHMS(metadata.duration))}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue='asr' className='w-full'>
        <TabsList className='w-full h-fit flex flex-col lg:flex-row'>
          <TabsTrigger value='asr' className='py-3 w-full lg:flex-auto'>
            Reconocimiento Automático del Habla
          </TabsTrigger>
          <TabsTrigger value='vad' className='py-3 w-full lg:flex-auto'>
            Detección de Actividad de Voz
          </TabsTrigger>
          <TabsTrigger value='additional' className='py-3 w-full lg:flex-auto'>
            Opciones adicionales
          </TabsTrigger>
        </TabsList>
        <TabsContent value='asr'>
          <Card>
            <CardHeader>
              <CardTitle className='text-lg md:text-xl'>
                Opciones de ASR
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <div className='flex justify-between mb-1'>
                  <span className='text-sm font-medium'>Tamaño del haz</span>
                  <span className='text-sm font-medium'>
                    {metadata.task_params.asr_options.beam_size}
                  </span>
                </div>
                <Progress
                  value={
                    (metadata.task_params.asr_options.beam_size / 10) * 100
                  }
                  className='h-2'
                />
              </div>
              <div>
                <div className='flex justify-between mb-1'>
                  <span className='text-sm font-medium'>
                    Umbral de no habla
                  </span>
                  <span className='text-sm font-medium'>
                    {metadata.task_params.asr_options.no_speech_threshold}
                  </span>
                </div>
                <Progress
                  value={
                    (metadata.task_params.asr_options.no_speech_threshold / 1) *
                    100
                  }
                  className='h-2'
                />
              </div>
              <div>
                <div className='flex justify-between mb-1'>
                  <span className='text-sm font-medium'>
                    Umbral de ratio de compresión
                  </span>
                  <span className='text-sm font-medium'>
                    {
                      metadata.task_params.asr_options
                        .compression_ratio_threshold
                    }
                  </span>
                </div>
                <Progress
                  value={
                    (metadata.task_params.asr_options
                      .compression_ratio_threshold /
                      3) *
                    100
                  }
                  className='h-2'
                />
              </div>
              <div>
                <div className='flex justify-between mb-1'>
                  <span className='text-sm font-medium'>Paciencia</span>
                  <span className='text-sm font-medium'>
                    {metadata.task_params.asr_options.patience}
                  </span>
                </div>
                <Progress
                  value={(metadata.task_params.asr_options.patience / 2) * 100}
                  className='h-2'
                />
              </div>
              <div>
                <div className='flex justify-between mb-1'>
                  <span className='text-sm font-medium'>Temperatura</span>
                  <span className='text-sm font-medium'>
                    {metadata.task_params.asr_options.temperatures}
                  </span>
                </div>
                <Progress
                  value={
                    (metadata.task_params.asr_options.temperatures / 1) * 100
                  }
                  className='h-2'
                />
              </div>
              <div>
                <div className='flex justify-between mb-1'>
                  <span className='text-sm font-medium'>
                    Penalización de longitud
                  </span>
                  <span className='text-sm font-medium'>
                    {metadata.task_params.asr_options.length_penalty}
                  </span>
                </div>
                <Progress
                  value={
                    (metadata.task_params.asr_options.length_penalty / 2) * 100
                  }
                  className='h-2'
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value='vad'>
          <Card>
            <CardHeader>
              <CardTitle className='text-lg md:text-xl'>
                Opciones de VAD
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <div className='flex justify-between mb-1'>
                  <span className='text-sm font-medium'>Inicio VAD</span>
                  <span className='text-sm font-medium'>
                    {metadata.task_params.vad_options.vad_onset}
                  </span>
                </div>
                <Progress
                  value={(metadata.task_params.vad_options.vad_onset / 1) * 100}
                  className='h-2'
                />
              </div>
              <div>
                <div className='flex justify-between mb-1'>
                  <span className='text-sm font-medium'>Fin VAD</span>
                  <span className='text-sm font-medium'>
                    {metadata.task_params.vad_options.vad_offset}
                  </span>
                </div>
                <Progress
                  value={
                    (metadata.task_params.vad_options.vad_offset / 1) * 100
                  }
                  className='h-2'
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value='additional'>
          <Card>
            <CardHeader>
              <CardTitle className='text-lg md:text-xl'>
                Opciones adicionales
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <p className='text-sm font-medium'>Hilos</p>
                  <p className='text-l'>{metadata.task_params.threads}</p>
                </div>
                <div>
                  <p className='text-sm font-medium'>Índice del dispositivo</p>
                  <p className='text-l'>{metadata.task_params.device_index}</p>
                </div>
                <div>
                  <p className='text-sm font-medium'>Máximo de hablantes</p>
                  <p className='text-l'>
                    {metadata.task_params.max_speakers || "No especificado"}
                  </p>
                </div>
                <div>
                  <p className='text-sm font-medium'>Mínimo de hablantes</p>
                  <p className='text-l'>
                    {metadata.task_params.min_speakers || "No especificado"}
                  </p>
                </div>
                <div>
                  <p className='text-sm font-medium'>Método de interpolación</p>
                  <p className='text-l'>
                    {metadata.task_params.interpolate_method}
                  </p>
                </div>
                <div>
                  <p className='text-sm font-medium'>
                    Alineaciones de caracteres
                  </p>
                  <p className='text-l'>
                    {metadata.task_params.return_char_alignments ? "Sí" : "No"}
                  </p>
                </div>
                <div>
                  <p className='text-sm font-medium'>Modelo de alineación</p>
                  <p className='text-l'>
                    {metadata.task_params.align_model || "No especificado"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  )
}

export default MetadataDisplay
