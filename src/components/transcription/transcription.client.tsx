// @/components/transcription/transcription.client.tsx
"use client"
import React, { RefObject } from "react"
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
import {
  cn,
  secondsToHMS,
  formatTimestamp,
  convertSpeakerToHablante,
} from "@/lib/utils"
import TitleH1 from "@/components/typography/titleH1"
import TranscriptionSkeleton from "../skeletons/transcription-skeleton"
import { ErrorCodeUserFriendly } from "../error/error-code-user-friendly"
import SpeakerAnalysisCard from "./speaker-analysis-card.client"
import { useTranscription } from "../context/TranscriptionProvider"
import TypographyH3 from "../typography/h3"
import { useAudioPlayer } from "../context/AudioProvider"

const BASIC_STYLE = "flex text-sm rounded-md p-2 gap-2"

type DrawerOptions = {
  show?: boolean
  text?: string
}
interface TSClientProps {
  taskId?: string
  drawerOptions?: DrawerOptions
}

export const TranscriptionClient: React.FC<TSClientProps> = ({
  taskId,
  drawerOptions,
}) => {
  const { transcription, isLoading, error, fetchTranscription } =
    useTranscription()

  let lastSpeaker: string | undefined = ""
  let lastEmotion: string | undefined = ""

  if (isLoading) return <TranscriptionSkeleton />

  const { toast } = useToast()

  const segmentRefs = React.useRef<(HTMLDivElement | null)[]>([])

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

  const player = useAudioPlayer()

  React.useEffect(() => {
    if (player.isPlaying && player.currentTime > 0) {
      scrollToSegment(player.currentTime)
    }
  }, [player.isPlaying, player.currentTime, , transcription?.result?.segments])

  const scrollToSegment = (timestamp: number) => {
    if (!transcription?.result?.segments) return
    const currentSegment = transcription.result.segments.find(
      segment => timestamp >= segment.start && timestamp <= segment.end
    )
    if (currentSegment) {
      const ref = segmentRefs.current[Number(currentSegment.start.toFixed(2))]
      ref?.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center",
      })
    }
  }

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
          <SpeakerAnalysisCard segments={transcription?.result?.segments} />
          <div className='flex flex-col space-y-2 p-0 px-2 w-full justify-start'>
            {taskId && <TaskHeader taskId={taskId} toast={toast} />}
            {/* <Analysis transcription={transcription} /> */}
            {transcription?.result?.segments.map((segment, index) => {
              const isNewSpeaker = segment?.speaker !== lastSpeaker
              lastSpeaker = segment.speaker
              const isNewEmotion =
                segment?.analysis?.emotion !== lastEmotion || isNewSpeaker
              lastEmotion = segment?.analysis?.emotion
              return (
                <>
                  <SegmentRenderer
                    ref={el => {
                      segmentRefs.current[Number(segment.start.toFixed(2))] = el
                    }}
                    key={`${segment.speaker}-segment-${index}`}
                    segment={segment}
                    renderSpeakerText={isNewSpeaker}
                    renderEmotion={isNewEmotion}
                  />
                </>
              )
            })}
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
  <div className='flex flex-row items-center space-x-4 w-full justify-center'>
    <TypographyH3 className='font-normal'>
      Transcripción de llamado con ID
      <span className='font-bold'> {taskId}</span>
    </TypographyH3>
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
  ></div>
)
interface EmojiProps {
  emotion: SegmentAnalysisProperties["emotion"]
}

const Emoji: React.FC<EmojiProps> = ({ emotion }) => (
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
  renderSpeakerText?: boolean
  renderEmotion?: boolean
}
const SegmentRenderer = React.forwardRef<HTMLDivElement, SegmentRendererProps>(
  ({ segment, renderSpeakerText = true, renderEmotion = true }, ref) => {
    const speakerNumber = parseInt(segment?.speaker?.split("_")[1], 10)
    const isEvenSpeaker = speakerNumber % 2 === 0

    return (
      <div
        ref={ref}
        className={cn(
          isEvenSpeaker ? "self-start items-start" : "self-end items-end mr-8",
          "flex flex-col gap-2"
        )}
      >
        {renderSpeakerText && (
          <span className='text-sm text-muted-foreground'>
            {convertSpeakerToHablante(segment.speaker)}
          </span>
        )}
        <div className='flex flex-row space-x-2'>
          {isEvenSpeaker ? (
            <>
              {segment.analysis && renderEmotion && (
                <Emoji emotion={segment.analysis.emotion} />
              )}
              <TextContainer segment={segment} />
              {segment.analysis && <EmotionBox />}
            </>
          ) : (
            <>
              {segment.analysis && <EmotionBox />}
              <TextContainer segment={segment} />
              {segment.analysis && renderEmotion ? (
                <Emoji emotion={segment.analysis.emotion} />
              ) : (
                <span className='text-3xl p-2' role='img'>
                  {" "}
                </span>
              )}
            </>
          )}
        </div>
      </div>
    )
  }
)
SegmentRenderer.displayName = "SegmentRenderer"

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
    <div className='flex flex-col justify-between gap-2 text-sm text-card-foreground'>
      {segment.text}
      <div className='text-xs dark:text-muted-foreground'>
        ({formatTimestamp(secondsToHMS(segment.start), false)} -{" "}
        {formatTimestamp(secondsToHMS(segment.end), false)})
      </div>
    </div>
  </div>
)
