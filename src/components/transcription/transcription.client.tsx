// @/components/transcription/transcription.client.tsx
"use client"
import * as React from "react"
import { useRouter } from "next/navigation"

import {
  Segment,
  Task,
  Status,
  SegmentAnalysisProperties,
  SupportedLocales,
} from "@/lib/types.d"

import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerClose,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
} from "@/components/ui/drawer"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useToast } from "@/components/ui/use-toast"

import { ChevronLeft, ClipboardIcon, MessageCircleQuestion } from "lucide-react"

import { GLOBAL_ICON_SIZE } from "@/lib/consts"
import { cn, secondsToHMS, formatTimestamp } from "@/lib/utils"

import TitleH1 from "@/components/typography/titleH1"
import SubtitleH2 from "@/components/typography/subtitleH2"

import Analysis from "@/components/transcription/analysis"
import TranscriptionSkeleton from "../skeletons/transcription-skeleton"
import { ErrorCodeUserFriendly } from "../error/error-code-user-friendly"
import SpeakerAnalysisCard from "./speaker-analysis-card.client"
import { useTranscription } from "../context/TranscriptionProvider"

const BASIC_STYLE = "flex text-sm rounded-md p-2 gap-2"

type DrawerOptions = {
  show?: boolean
  text?: string
}

export default function TranscriptionClient({
  taskId,
  drawerOptions,
}: {
  taskId?: string
  drawerOptions?: DrawerOptions
}) {
  const { toast } = useToast()

  const { transcription, isLoading, error, fetchTranscription } =
    useTranscription()
  let isAnalysisNotReady =
    transcription &&
    [
      Status.Values.pending,
      Status.Values.processing,
      Status.Values.failed,
      // @ts-ignore
    ].includes(transcription.status)
  React.useEffect(() => {
    if (taskId) {
      fetchTranscription(taskId)
    }
  }, [taskId, fetchTranscription])
  if (isLoading) return <TranscriptionSkeleton />
  return (
    <>
      {drawerOptions?.show && (
        <TranscriptionNotReady text={`${drawerOptions?.text || ""}`} />
      )}
      {!drawerOptions?.show && isLoading && <TranscriptionSkeleton />}

      {!drawerOptions?.show && transcription && (
        <>
          {isAnalysisNotReady && (
            <TranscriptionNotReady status={transcription?.status} />
          )}
          <SpeakerAnalysisCard segments={transcription?.result?.segments}>
            {""}
          </SpeakerAnalysisCard>
          <div className='flex flex-col space-y-2 py-10 pl-4 pr-16'>
            {taskId && <TaskHeader taskId={taskId} toast={toast} />}
            <Analysis transcription={transcription} />
            {transcription?.result?.segments.map((segment, index) => (
              <SegmentRenderer
                key={`${segment.speaker}-segment-${index}`}
                segment={segment}
              />
            ))}
          </div>
        </>
      )}
      {error && (
        <ErrorCodeUserFriendly
          error={error}
          locale={SupportedLocales.Values.es}
        />
      )}
    </>
  )
}

interface TaskHeaderProps {
  taskId: Task["identifier"]
  toast: ReturnType<typeof useToast>["toast"]
}

const TaskHeader: React.FC<TaskHeaderProps> = ({ taskId, toast }) => (
  <div className='flex flex-row items-center space-x-4 self-center'>
    <SubtitleH2>
      Transcripción de llamado con ID
      <span className='font-bold'> {taskId}</span>
    </SubtitleH2>
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant='outline'
            onClick={() => {
              toast({ title: "Se copió el ID", description: taskId })
              navigator.clipboard.writeText(taskId)
            }}
          >
            <ClipboardIcon size={GLOBAL_ICON_SIZE} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Copiar ID</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </div>
)

interface TranscriptionNotReadyProps {
  status?: Status
  text?: string
}

const TranscriptionNotReady: React.FC<TranscriptionNotReadyProps> = ({
  status,
  text,
}) => {
  const router = useRouter()
  return (
    <Drawer open={true}>
      <DrawerContent className='focus:border focus:outline-none'>
        <DrawerHeader>
          <DrawerTitle className='mx-auto'>
            <TitleH1>
              {text
                ? text
                : `Esta tarea
            ${
              status === "failed"
                ? "falló"
                : "no está lista para ser visualizada"
            }
            .`}
            </TitleH1>
          </DrawerTitle>
        </DrawerHeader>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button
              variant='outline'
              className='w-full'
              onClick={() => router.back()}
            >
              <ChevronLeft /> Volver
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

const SentimentMarker: React.FC<{ sentiment: string }> = ({ sentiment }) => (
  <div
    className={cn(
      {
        "bg-success": sentiment === "POS",
        "bg-yellow-500": sentiment === "NEU",
        "bg-destructive": sentiment === "NEG",
      },
      "inline-block w-1 min-w-1 h-full rounded-md p-0.5"
    )}
  />
)
interface EmojiProps {
  emotion: SegmentAnalysisProperties["emotion"]
}

const Emoji: React.FC<EmojiProps> = ({ emotion }) => (
  <div className={`${BASIC_STYLE} flex-row justify-between items-center`}>
    <span className='text-3xl' role='img'>
      {{
        joy: "😀",
        fear: "😱",
        anger: "😡",
        others: "😐",
        sadness: "😢",
        disgust: "🤢",
        surprise: "😮",
      }[emotion] || ""}
    </span>
  </div>
)

const EmotionBox: React.FC = () => (
  <div className={`${BASIC_STYLE} flex-row justify-between items-center`}>
    <Button variant='outline' className='w-fit p-2'>
      <MessageCircleQuestion size={GLOBAL_ICON_SIZE} />
    </Button>
  </div>
)
interface SegmentRendererProps {
  segment: Segment
}

const SegmentRenderer: React.FC<SegmentRendererProps> = ({ segment }) => {
  const speakerNumber = parseInt(segment?.speaker?.split("_")[1], 10)
  const isEvenSpeaker = speakerNumber % 2 === 0

  return (
    <div
      className={cn(
        "flex flex-row space-x-2",
        isEvenSpeaker ? "self-start" : "self-end"
      )}
    >
      {isEvenSpeaker ? (
        <>
          {segment.analysis && <Emoji emotion={segment.analysis.emotion} />}
          <TextContainer segment={segment} />
          {segment.analysis && <EmotionBox />}
        </>
      ) : (
        <>
          {segment.analysis && <EmotionBox />}
          <TextContainer segment={segment} />
          {segment.analysis && <Emoji emotion={segment.analysis.emotion} />}
        </>
      )}
    </div>
  )
}

interface TextContainerProps {
  segment: Segment
}

const TextContainer: React.FC<TextContainerProps> = ({ segment }) => (
  <div
    className={cn(
      "text-wrap max-w-[500px] flex-row justify-between outline outline-1 outline-muted bg-popover shadow-md dark:shadow-lg",
      BASIC_STYLE
    )}
  >
    {segment.analysis?.sentiment && (
      <SentimentMarker sentiment={segment.analysis.sentiment} />
    )}
    <div className='flex flex-col justify-between gap-2 text-sm'>
      {segment.text}
      <div className='text-xs text-muted-foreground'>
        ({formatTimestamp(secondsToHMS(segment.start), false)} -{" "}
        {formatTimestamp(secondsToHMS(segment.end), false)})
      </div>
    </div>
  </div>
)
