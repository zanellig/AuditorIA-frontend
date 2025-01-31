"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Mic,
  Cpu,
  HardDrive,
  Clock,
  FileAudio,
  Languages,
  Settings,
} from "lucide-react"
import { ITranscription } from "@/lib/types"

interface IMetadataDisplayProps {
  metadata: ITranscription["metadata"]
}

const MetadataDisplay: React.FC<IMetadataDisplayProps> = ({
  metadata,
}: IMetadataDisplayProps) => {
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
              {metadata.task_type}
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
            <p className='text-xs text-muted-foreground'>Español</p>
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
                {metadata.duration.toFixed(2)} segundos
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue='asr' className='w-full'>
        <TabsList className='grid w-full grid-cols-2'>
          <TabsTrigger value='asr' className='text-xs sm:text-sm truncate'>
            Reconocimiento Automático del Habla
          </TabsTrigger>
          <TabsTrigger value='vad' className='text-xs sm:text-sm truncate'>
            Detección de Actividad de Voz
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
      </Tabs>
    </>
  )
}

export default MetadataDisplay
