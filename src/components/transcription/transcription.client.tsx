"use client"

import Link from "next/link"

import {
  Segment,
  SentimentType,
  TranscriptionType,
  Task,
  Status,
  SegmentAnalysisProperties,
} from "@/lib/types.d"

import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerTrigger,
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

import {
  GLOBAL_ICON_SIZE,
  NEGATIVE_SENTIMENT_COLOR,
  NEUTRAL_SENTIMENT_COLOR,
  POSITIVE_SENTIMENT_COLOR,
} from "@/lib/consts"
import { cn, secondsToHMS, formatTimestamp } from "@/lib/utils"

import TitleH1 from "@/components/typography/titleH1"
import SubtitleH2 from "@/components/typography/subtitleH2"

import Analysis from "@/components/transcription/analysis"

interface TranscriptionClientProps {
  transcription: TranscriptionType
  taskId: Task["identifier"]
}

const BASIC_STYLE = " flex text-sm rounded-md p-2 gap-2 "

const TranscriptionClient = ({
  transcription,
  taskId,
}: TranscriptionClientProps) => {
  const { toast } = useToast()

  function renderAnalysisWithSegment(
    segment: Segment,
    speaker: Segment["speaker"]
  ) {
    return (
      <div className='flex flex-row space-x-2'>
        {renderBoxesBySpeaker(segment, speaker)}
      </div>
    )
  }

  const isAnalysisNotReady = [
    Status.Pending,
    Status.Processing,
    Status.Failed,
  ].includes(transcription.status)

  return (
    <>
      {isAnalysisNotReady && (
        <TranscriptionNotReady status={transcription.status} />
      )}

      <div className={cn("flex flex-col space-y-2 py-10 pl-4 pr-16")}>
        <div className='flex flex-row items-center space-x-4 self-center'>
          <SubtitleH2>
            Transcripción de llamado con ID
            <span className='font-bold'> {taskId}</span>
          </SubtitleH2>
          <Tooltip>
            <TooltipProvider>
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
            </TooltipProvider>
            <TooltipContent>Copiar ID</TooltipContent>
          </Tooltip>
        </div>
        <Analysis transcription={transcription} />

        {transcription?.result?.segments.map((segment: Segment, i: number) => {
          let speaker = segment.speaker
          if (speaker) {
            return (
              <div
                key={`${speaker}-segment-${i}`}
                className={speaker === "SPEAKER_01" ? "self-end" : "self-start"}
              >
                {renderAnalysisWithSegment(segment, speaker)}
              </div>
            )
          }
          return null
        })}
      </div>
      {/* BUTTON FOR DEV ONLY, DELETE ONCE DONE */}
    </>
  )
}

export function TranscriptionNotReady({ status }: { status: Status }) {
  if (status === "failed" || "pending" || "processing") {
    return (
      <Drawer open={true}>
        <DrawerTrigger />
        <DrawerContent className='focus:border focus:outline-none'>
          <DrawerHeader>
            <DrawerTitle className='mx-auto'>
              <TitleH1>
                Esta tarea{" "}
                {status === "failed"
                  ? "falló"
                  : "no está lista para ser visualizada"}
                .
              </TitleH1>
            </DrawerTitle>
          </DrawerHeader>
          <DrawerFooter>
            <DrawerClose asChild>
              <Link href={"/dashboard"}>
                <Button variant='outline' className='w-full'>
                  <ChevronLeft /> Volver al dashboard
                </Button>
              </Link>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    )
  }
}
/**
 * joy -> 😀
 * fear -> 😱
 * anger -> 😡
 * others -> 😐
 * sadness -> 😢
 * disgust -> 🤢
 * surprise -> 😮
 */

/**
 *  FIXME: Esto es horrible y hay que cambiarlo
 */
export function renderBoxesBySpeaker(
  segment: Segment,
  speaker: Segment["speaker"]
) {
  switch (speaker) {
    case "SPEAKER_00":
      return (
        <>
          {segment.analysis ? <Emoji segment={segment} /> : null}
          <TextContainer segment={segment} />
          {segment.analysis ? <EmotionBox /> : null}
        </>
      )
    case "SPEAKER_01":
      return (
        <>
          {segment.analysis ? <EmotionBox /> : null}
          <TextContainer segment={segment} />
          {segment.analysis ? <Emoji segment={segment} /> : null}
        </>
      )
  }
}

export function ChatBox({
  text,
  speaker,
  start,
  end,
  analysis,
}: {
  text: Segment["text"]
  speaker: Segment["speaker"]
  start: Segment["start"]
  end: Segment["end"]
  analysis?: Segment["analysis"]
}) {
  let sentiment
  if (analysis?.sentiment) {
    sentiment = analysis.sentiment
  } else return null
  switch (speaker) {
    case "SPEAKER_00":
      return (
        <>
          {sentiment && (
            <SentimentMarker sentiment={sentiment as SentimentType} />
          )}
          <TextBox text={text} start={start} end={end} />
        </>
      )
    case "SPEAKER_01":
      return (
        <>
          <TextBox text={text} start={start} end={end} />
          {sentiment && (
            <SentimentMarker sentiment={sentiment as SentimentType} />
          )}
        </>
      )
    case "SPEAKER_02":
      return (
        <>
          {sentiment && (
            <SentimentMarker sentiment={sentiment as SentimentType} />
          )}
          <TextBox text={text} start={start} end={end} />
        </>
      )
  }
}

export function TextBox({
  text,
  start,
  end,
}: {
  text: Segment["text"]
  start: Segment["start"]
  end: Segment["end"]
}) {
  return (
    <div className='flex flex-col justify-between gap-2'>
      {text}
      <div className='text-xs text-muted-foreground'>
        <Timestamp {...{ start: start, end: end }} />
      </div>
    </div>
  )
}

export function Timestamp({
  start,
  end,
}: {
  start: Segment["start"]
  end: Segment["end"]
}) {
  const startTime = secondsToHMS(start)
  const endTime = secondsToHMS(end)
  return `( ${formatTimestamp(startTime, false)} - ${formatTimestamp(
    endTime,
    false
  )} )`
}

export function SentimentMarker({ sentiment }: { sentiment: SentimentType }) {
  return (
    <div
      className={
        sentimentStyle(sentiment) + " w-[3px] h-auto rounded-md p-0.5 "
      }
    ></div>
  )
}
function sentimentStyle(sentiment: SentimentType) {
  switch (sentiment) {
    case "POS":
      return `bg-${POSITIVE_SENTIMENT_COLOR}`
    case "NEU":
      return `bg-${NEUTRAL_SENTIMENT_COLOR}`
    case "NEG":
      return `bg-${NEGATIVE_SENTIMENT_COLOR}`
  }
}

export function Emoji({ segment }: { segment: Segment }) {
  return (
    <div className={BASIC_STYLE + "flex-row justify-between items-center"}>
      <div className='text-2xl'>
        {getEmojiForEmotion(segment.analysis?.emotion)}
      </div>
    </div>
  )
}

export function EmotionBox() {
  return (
    <div className={BASIC_STYLE + "flex-row justify-between items-center"}>
      <Button variant='outline' className='w-fit p-2'>
        <MessageCircleQuestion size={GLOBAL_ICON_SIZE} />
      </Button>
    </div>
  )
}

export function TextContainer({ segment }: { segment: Segment }) {
  return (
    <div
      className={
        "text-wrap max-w-[500px] flex-row justify-between outline outline-1 outline-muted" +
        BASIC_STYLE
      }
    >
      <ChatBox {...segment} />
    </div>
  )
}

export function getEmojiForEmotion(
  emotion?: SegmentAnalysisProperties["emotion"]
) {
  let emoji = ""

  switch (emotion) {
    case "joy":
      emoji = "😀"
      break
    case "fear":
      emoji = "😱"
      break
    case "anger":
      emoji = "😡"
      break
    case "others":
      emoji = "😐"
      break
    case "sadness":
      emoji = "😢"
      break
    case "disgust":
      emoji = "🤢"
      break
    case "surprise":
      emoji = "😮"
      break
  }

  return emoji
}

export default TranscriptionClient
