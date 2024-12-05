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
  Frown,
  Laugh,
  Meh,
  MessageCircleQuestion,
  TriangleAlert,
} from "lucide-react"
import { GLOBAL_ICON_SIZE } from "@/lib/consts"
import {
  cn,
  secondsToHMS,
  formatTimestamp,
  convertSpeakerToHablante,
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
import TitleContainer from "@/components/title-container"

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
  const { transcription, isLoading, error, fetchTranscription } =
    useTranscription()

  const transcriptionMock = {
    status: "completed",
    result: {
      segments: [
        {
          start: 0.0,
          end: 7.5,
          text: "Why don’t you just leave the tech stuff to the men? Clearly, it’s not your forte.",
          speaker: "Tom Wilson (Business Person)",
          analysis: {
            emotion: "anger",
            sentiment: "NEG",
            hate_speech: "targeted",
            emotion_probas: {
              joy: 0.01,
              fear: 0.1,
              anger: 0.8,
              others: 0.03,
              disgust: 0.05,
              sadness: 0.01,
              surprise: 0.0,
            },
            sentiment_probas: {
              NEG: 0.95,
              NEU: 0.03,
              POS: 0.02,
            },
            hate_speech_probas: {
              hateful: 0.6,
              targeted: 0.9,
              aggressive: 0.7,
            },
            is_hate_speech: true,
          },
        },
        {
          start: 7.5,
          end: 15.0,
          text: "That’s completely uncalled for. I am doing my job, and comments like that are unacceptable.",
          speaker: "Emily Clark (IT Support Analyst)",
          analysis: {
            emotion: "anger",
            sentiment: "NEG",
            hate_speech: "neutral",
            emotion_probas: {
              joy: 0.01,
              fear: 0.2,
              anger: 0.6,
              others: 0.1,
              disgust: 0.07,
              sadness: 0.02,
              surprise: 0.0,
            },
            sentiment_probas: {
              NEG: 0.8,
              NEU: 0.15,
              POS: 0.05,
            },
            hate_speech_probas: {
              hateful: 0.1,
              targeted: 0.2,
              aggressive: 0.3,
            },
            is_hate_speech: false,
          },
        },
        {
          start: 15.0,
          end: 20.0,
          text: "It’s not personal, it’s just that women aren’t known for excelling in tech fields.",
          speaker: "Tom Wilson (Business Person)",
          analysis: {
            emotion: "disgust",
            sentiment: "NEG",
            hate_speech: "targeted",
            emotion_probas: {
              joy: 0.0,
              fear: 0.05,
              anger: 0.4,
              others: 0.1,
              disgust: 0.4,
              sadness: 0.05,
              surprise: 0.0,
            },
            sentiment_probas: {
              NEG: 0.9,
              NEU: 0.05,
              POS: 0.05,
            },
            hate_speech_probas: {
              hateful: 0.8,
              targeted: 0.95,
              aggressive: 0.5,
            },
            is_hate_speech: true,
          },
        },
        {
          start: 20.0,
          end: 25.0,
          text: "Your sexism is noted. I’ll escalate this to HR immediately.",
          speaker: "Emily Clark (IT Support Analyst)",
          analysis: {
            emotion: "anger",
            sentiment: "NEG",
            hate_speech: "neutral",
            emotion_probas: {
              joy: 0.0,
              fear: 0.1,
              anger: 0.7,
              others: 0.1,
              disgust: 0.05,
              sadness: 0.05,
              surprise: 0.0,
            },
            sentiment_probas: {
              NEG: 0.85,
              NEU: 0.1,
              POS: 0.05,
            },
            hate_speech_probas: {
              hateful: 0.1,
              targeted: 0.2,
              aggressive: 0.3,
            },
            is_hate_speech: false,
          },
        },
      ],
    },
    error: null,
    metadata: {
      audio_duration: 25.0,
      duration: 25.0,
      file_name: "sexist_conversation.wav",
      language: "en",
      task_params: {
        task: "transcription",
        model: "default_model",
        device: "cpu",
        threads: 4,
        language: "en",
        batch_size: 1,
        compute_type: "float32",
        device_index: 0,
        max_speakers: 2,
        min_speakers: 1,
        align_model: null,
        asr_options: {
          patience: 1.0,
          beam_size: 5,
          temperatures: 0.7,
          initial_prompt: null,
          length_penalty: 1.0,
          suppress_tokens: [1, 2],
          suppress_numerals: false,
          log_prob_threshold: -1.0,
          no_speech_threshold: 0.5,
          compression_ratio_threshold: 1.5,
        },
        vad_options: {
          vad_onset: 0.5,
          vad_offset: 0.5,
        },
      },
      task_type: "transcription",
      url: "http://example.com/sexist_conversation",
    },
  }

  let lastSpeaker: string | undefined = ""
  let lastEmotion: string | undefined = ""

  const { toast } = useToast()

  const segmentRefs = React.useRef<(HTMLDivElement | null)[]>([])

  const isAnalysisNotReady =
    transcription &&
    [
      Status.Values.pending,
      Status.Values.processing,
      Status.Values.failed,
      // @ts-expect-error TS(2345): Argument of type 'Status' is not assignable to parameter of type 'Status'.
    ].includes(transcription.status)
  React.useEffect(() => {
    if (taskId) {
      fetchTranscription(taskId)
    }
  }, [taskId, fetchTranscription])

  const player = useAudioPlayer()

  React.useEffect(() => {
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
    if (player.isPlaying && player.currentTime > 0) {
      scrollToSegment(player.currentTime)
    }
  }, [player.isPlaying, player.currentTime, transcription?.result?.segments])

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
          <SpeakerAnalysisCard segments={transcription?.result?.segments} />
          <TableContainer>
            {taskId && (
              <TitleContainer separate>
                <TaskHeader taskId={taskId} toast={toast} />
              </TitleContainer>
            )}
            <section className='flex gap-2 items-center mt-4'>
              <AnalyzeTaskButton taskId={taskId} />
              <Button
                variant={"destructive"}
                onClick={() => {
                  toast({
                    title: "Se ha reportado la tarea",
                  })
                }}
                Icon={TriangleAlert}
                iconPlacement={"left"}
                className='w-full lg:w-32'
              >
                Reportar tarea
              </Button>
            </section>
            {/* <section className='flex border mt-2'>
              <code className='text-wrap max-w-xl'>
                {JSON.stringify(transcription)}
              </code> */}
            {/* Segments */}
            <article className='flex flex-col w-full'>
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
                        segmentRefs.current[Number(segment.start.toFixed(2))] =
                          el
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
            {/* </section> */}
          </TableContainer>
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
    const EMOJI_CONTAINER_CLASSES = "min-w-10 relative w-10"
    const { isPlaying, currentTime } = useAudioPlayer()
    const isCurrentSegmentFocused =
      currentTime >= segment.start && currentTime <= segment.end + 0.5

    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col gap-2 w-full transition-colors duration-200 rounded-md px-4 py-1",
          isEvenSpeaker ? "self-start items-start" : "self-end items-end",
          isPlaying && isCurrentSegmentFocused
            ? "bg-pulse"
            : "bg-transparent dark:bg-transparent"
        )}
      >
        {renderSpeakerText && (
          <span className='text-sm text-muted-foreground'>
            {convertSpeakerToHablante(segment.speaker)}
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
    <div className='flex flex-col justify-between gap-2 text-xl text-card-foreground'>
      <ParagraphP>{segment.text}</ParagraphP>
      <div className='text-xs dark:text-muted-foreground'>
        ({formatTimestamp(secondsToHMS(segment.start), false)} -{" "}
        {formatTimestamp(secondsToHMS(segment.end), false)})
      </div>
    </div>
  </div>
)
