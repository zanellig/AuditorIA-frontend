// @/components/transcription/transcription.client.tsx
"use client"
import React from "react"
import { useRouter } from "next/navigation"
import {
  Segment,
  Task,
  Status,
  SegmentAnalysisProperties,
  SupportedLocales,
} from "@/lib/types.d"
import { Button } from "@/components/ui/button"
import { AnalyzeTaskButton } from "@/components/analyze-task-button"
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
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useToast } from "@/components/ui/use-toast"
import {
  Angry,
  Annoyed,
  ChevronLeft,
  ClipboardIcon,
  Clock,
  FileAudio,
  Frown,
  Laugh,
  Meh,
  User,
  Phone,
  CalendarClock,
  ArrowLeftRight,
} from "lucide-react"
import { GLOBAL_ICON_SIZE } from "@/lib/consts"
import {
  cn,
  secondsToHMS,
  formatTimestamp,
  localizeSpeaker,
  handleCopyToClipboard,
  getSpanishEmotion,
  getColorForEmotion,
} from "@/lib/utils"
import TitleH1 from "@/components/typography/titleH1"
import TranscriptionSkeleton from "@/components/skeletons/transcription-skeleton"
import { ErrorCodeUserFriendly } from "@/components/error/error-code-user-friendly"
import SpeakerAnalysisCard from "@/components/transcription/speaker-analysis-card.client"
import { useTranscription } from "@/components/context/TranscriptionProvider"
import TypographyH3 from "@/components/typography/h3"
import { useAudioPlayer } from "@/components/context/AudioProvider"
import ParagraphP from "@/components/typography/paragraphP"
import { SurpriseIcon } from "@/components/emoji-icons"
import TableContainer from "@/components/tables/table-core/table-container"
import { FloatingFeedbackPopover } from "./transcription-feedback-popover"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { useRecordingContext } from "../context/RecordingProvider"

const BASIC_STYLE = "flex text-sm rounded-md p-2 gap-2"

interface DrawerOptions {
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
  const { transcription, fetchTranscription, queryStatus } = useTranscription()
  const { recordingQuery } = useRecordingContext()

  let lastSpeaker: string | undefined = ""
  let lastEmotion: string | undefined = ""

  const segmentRefs = React.useRef<(HTMLDivElement | null)[]>([])

  const isAnalysisNotReady =
    transcription &&
    [
      Status.Values.pending as Status,
      Status.Values.processing as Status,
      Status.Values.failed as Status,
    ].includes(transcription.status)
  React.useEffect(() => {
    if (taskId) {
      fetchTranscription(taskId)
    }
    // Don't put the fetchTranscription function inside the dependency array because it will cause an infinite loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId])

  const player = useAudioPlayer()

  React.useEffect(() => {
    const scrollToSegment = (timestamp: number) => {
      if (!transcription?.result.segments) return
      if (!player.isPlaying) return
      if (player.currentTime > 0) return

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
    scrollToSegment(player.currentTime)
  }, [player.isPlaying, player.currentTime, transcription?.result?.segments])

  if (queryStatus.isPending) return <TranscriptionSkeleton />
  if (queryStatus.error)
    return (
      <ErrorCodeUserFriendly
        error={queryStatus.error}
        locale={SupportedLocales.Values.es}
      />
    )

  return (
    <>
      {drawerOptions?.show && (
        <TranscriptionNotReady text={`${drawerOptions?.text || ""}`} />
      )}
      {!drawerOptions?.show && transcription && (
        <>
          {isAnalysisNotReady && (
            <TranscriptionNotReady status={transcription?.status} />
          )}
          <SpeakerAnalysisCard segments={transcription?.result?.segments} />
          <TableContainer>
            {/* {taskId && (
              <TitleContainer separate>
                <TaskHeader taskId={taskId} toast={toast} />
              </TitleContainer>
            )} */}
            <section className='flex flex-col lg:flex-row gap-2 items-start mt-6 justify-start'>
              <Card className='mb-4 md:mb-6 w-full'>
                <CardHeader>
                  <CardTitle className='text-lg md:text-xl'>
                    Información del archivo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 mb-4'>
                    <FileAudio className='h-6 w-6 text-primary' />
                    <div className='flex-1 min-w-0'>
                      <p className='text-sm font-medium truncate'>
                        Nombre del archivo
                      </p>
                      <p className='text-xs text-muted-foreground truncate'>
                        {transcription?.metadata.file_name}
                      </p>
                    </div>
                  </div>
                  <div className='flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4'>
                    <Clock className='h-6 w-6 text-primary' />
                    <div className='flex-1 min-w-0'>
                      <p className='text-sm font-medium'>Duración</p>
                      <p className='text-xs text-muted-foreground'>
                        {formatTimestamp(
                          secondsToHMS(transcription?.metadata.duration)
                        )}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className='mb-4 md:mb-6 w-full'>
                <CardHeader>
                  <CardTitle className='text-lg md:text-xl'>
                    Información del llamado
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                    <div className='flex flex-col items-start space-y-2'>
                      <div className='flex items-center gap-2'>
                        <User className='h-6 w-6 text-primary' />
                        <div className='flex-1 min-w-0'>
                          <p className='text-sm font-medium truncate'>
                            Operador
                          </p>
                          <p className='text-xs text-muted-foreground'>
                            {recordingQuery.data?.USUARIO}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className='flex flex-col items-start space-y-2'>
                      <div className='flex items-center gap-2'>
                        <FileAudio className='h-6 w-6 text-primary' />
                        <div className='flex-1 min-w-0'>
                          <p className='text-sm font-medium truncate'>
                            ID de llamada
                          </p>
                          <p className='text-xs text-muted-foreground'>
                            {recordingQuery.data?.IDLLAMADA}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className='flex flex-col items-start space-y-2'>
                      <div className='flex items-center gap-2'>
                        <Phone className='h-6 w-6 text-primary' />
                        <div className='flex-1 min-w-0'>
                          <p className='text-sm font-medium truncate'>
                            Teléfono
                          </p>
                          <p className='text-xs text-muted-foreground'>
                            {recordingQuery.data?.ANI_TELEFONO}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className='flex flex-col items-start space-y-2'>
                      <div className='flex items-center gap-2'>
                        <ArrowLeftRight className='h-6 w-6 text-primary' />
                        <div className='flex-1 min-w-0'>
                          <p className='text-sm font-medium truncate'>
                            Dirección
                          </p>
                          <p className='text-xs text-muted-foreground'>
                            {recordingQuery.data?.DIRECCION}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className='flex flex-col items-start space-y-2'>
                      <div className='flex items-center gap-2'>
                        <CalendarClock className='h-6 w-6 text-primary' />
                        <div className='flex-1 min-w-0'>
                          <p className='text-sm font-medium truncate'>
                            Fecha y hora
                          </p>
                          <p className='text-xs text-muted-foreground'>
                            {recordingQuery.data?.INICIO?.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {transcription?.status !== "analyzed" && (
                <AnalyzeTaskButton taskId={taskId!} />
              )}
            </section>
            <section className='flex gap-2 flex-col lg:flex-row'>
              {/* Segments */}
              <article className='flex flex-col gap-2 h-fit w-full p-4'>
                <CardTitle className='text-lg md:text-xl'>
                  Conversación
                </CardTitle>
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
                          segmentRefs.current[
                            Number(segment.start.toFixed(2))
                          ] = el
                        }}
                        key={`${segment.speaker}-segment-${index}`}
                        segment={segment}
                        renderSpeakerText={isNewSpeaker}
                        renderEmotion={isNewEmotion}
                      />
                    </>
                  )
                })}
              </article>
            </section>
            {transcription && (
              <FloatingFeedbackPopover
                feedbackHandler={feedback => {
                  console.log(`User feedback: ${feedback}`)
                }}
              />
            )}
          </TableContainer>
        </>
      )}
    </>
  )
}

interface TaskHeaderProps {
  taskId: Task["identifier"]
  toast: ReturnType<typeof useToast>["toast"]
}

const TaskHeader: React.FC<TaskHeaderProps> = ({ taskId, toast }) => (
  <div className='flex flex-row items-center space-x-4 w-full justify-start'>
    <TypographyH3 className='font-normal'>
      Transcripción de llamado con ID
      <span className='font-bold'> {taskId}</span>
    </TypographyH3>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant='outline'
          onClick={() => {
            toast({ title: "Se copió el ID", description: taskId })
            handleCopyToClipboard(taskId)
          }}
        >
          <ClipboardIcon size={GLOBAL_ICON_SIZE} />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Copiar ID</TooltipContent>
    </Tooltip>
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
            }.`}
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
const EMOJI_SIZE = GLOBAL_ICON_SIZE * 2
const Emoji: React.FC<EmojiProps> = ({ emotion }) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <span
        className={cn(
          "flex items-center w-full",
          emotion ? "" : "hidden",
          `text-${getColorForEmotion(emotion)}`
        )}
      >
        {{
          joy: (
            <Laugh
              size={EMOJI_SIZE}
              className={`text-${getColorForEmotion(emotion)}`}
            />
          ),
          fear: (
            <SurpriseIcon
              size={EMOJI_SIZE}
              className={`text-${getColorForEmotion(emotion)}`}
            />
          ),
          anger: (
            <Angry
              size={EMOJI_SIZE}
              className={`text-${getColorForEmotion(emotion)}`}
            />
          ),
          others: (
            <Meh
              size={EMOJI_SIZE}
              className={`text-${getColorForEmotion(emotion)}`}
            />
          ),
          sadness: (
            <Frown
              size={EMOJI_SIZE}
              className={`text-${getColorForEmotion(emotion)}`}
            />
          ),
          disgust: (
            <Annoyed
              size={EMOJI_SIZE}
              className={`text-${getColorForEmotion(emotion)}`}
            />
          ),
          surprise: (
            <SurpriseIcon
              size={EMOJI_SIZE}
              className={`text-${getColorForEmotion(emotion)}`}
            />
          ),
        }[emotion] || ""}
      </span>
    </TooltipTrigger>
    <TooltipContent className='capitalize text-md'>
      {getSpanishEmotion(emotion)}
    </TooltipContent>
  </Tooltip>
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
    const EMOJI_CONTAINER_CLASSES = "min-w-10 relative w-10"
    const { isPlaying, currentTime } = useAudioPlayer()
    const isCurrentSegmentFocused =
      currentTime >= segment.start && currentTime <= segment.end + 0.5

    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col gap-2 w-full transition-colors duration-200 rounded-md",
          isEvenSpeaker ? "self-start items-start" : "self-end items-end",
          isPlaying && isCurrentSegmentFocused
            ? "bg-pulse"
            : "bg-transparent dark:bg-transparent"
        )}
      >
        {renderSpeakerText && (
          <span className='text-sm text-muted-foreground'>
            {localizeSpeaker(segment.speaker)}
          </span>
        )}
        <div className='flex flex-row gap-2'>
          {isEvenSpeaker ? (
            <>
              <div className={EMOJI_CONTAINER_CLASSES}>
                {segment.analysis ? (
                  <Emoji
                    emotion={renderEmotion ? segment.analysis.emotion : ""}
                  />
                ) : null}
              </div>
              <TextContainer
                segment={segment}
                isCurrentSegmentFocused={isCurrentSegmentFocused}
              />
            </>
          ) : (
            <>
              <TextContainer
                segment={segment}
                isCurrentSegmentFocused={isCurrentSegmentFocused}
              />
              <div className={EMOJI_CONTAINER_CLASSES}>
                {segment.analysis ? (
                  <Emoji
                    emotion={renderEmotion ? segment.analysis.emotion : ""}
                  />
                ) : null}
              </div>
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
  isCurrentSegmentFocused?: boolean
}

const TextContainer: React.FC<TextContainerProps> = ({
  segment,
  isCurrentSegmentFocused = false,
}) => (
  <div
    className={cn(
      "text-wrap max-w-[500px] flex-row justify-between outline outline-1 outline-muted bg-popover shadow-md dark:shadow-lg",
      BASIC_STYLE,
      isCurrentSegmentFocused && "ring-2 ring-inset"
    )}
  >
    {segment.analysis?.sentiment && (
      <SentimentMarker sentiment={segment.analysis.sentiment} />
    )}
    <div className='flex flex-col justify-between gap-2 text-card-foreground'>
      <ParagraphP className='text-lg'>{segment.text}</ParagraphP>
      <div className='text-xs dark:text-muted-foreground'>
        ({formatTimestamp(secondsToHMS(segment.start))} -{" "}
        {formatTimestamp(secondsToHMS(segment.end))})
      </div>
    </div>
  </div>
)
