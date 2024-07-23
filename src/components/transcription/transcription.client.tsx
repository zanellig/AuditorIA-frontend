"use client"

import { useState, useEffect } from "react"
import { Segment, SentimentType, TranscriptionType, Task } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { MessageCircleQuestion } from "lucide-react"
import { GLOBAL_ICON_SIZE } from "@/lib/consts"
import { useSearchParams } from "next/navigation"

interface TranscriptionClientProps {
  transcription: TranscriptionType
  taskId: Task["identifier"]
}

function sentimentStyle(sentiment: SentimentType) {
  switch (sentiment) {
    case "POS":
      return "bg-green-500"
    case "NEU":
      return "bg-yellow-500"
    case "NEG":
      return "bg-red-500"
  }
}

const BASIC_STYLE = " flex text-sm rounded-md p-2 gap-2 "

const TranscriptionClient = ({
  transcription,
  taskId,
}: TranscriptionClientProps) => {
  const [UUID, setUUID] = useState<Task["identifier"]>(taskId)
  const searchParams = useSearchParams()

  useEffect(() => {
    const search = searchParams.get("search")
    if (search) {
      setUUID(search)
    }
  }, [searchParams])

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

  return (
    <>
      <div className='container mt-10'>
        <div className='flex flex-col space-y-2 w-full'>
          <div className='text-lg'>
            Transcripción de llamado ID{" "}
            <span className='font-bold'>{UUID}</span>{" "}
          </div>

          {transcription?.result?.segments.map(
            (segment: Segment, i: number) => {
              let speaker = segment.speaker

              return (
                <div
                  key={`${speaker}-segment-${i}`}
                  className={
                    speaker === "SPEAKER_01" ? "self-end" : "self-start"
                  }
                >
                  {renderAnalysisWithSegment(segment, speaker)}
                </div>
              )
            }
          )}
        </div>
        <div id='DEBUG-INFO-FOR-DEV-ONLY' className='container'>
          <code>{JSON.stringify(transcription)}</code>
        </div>
      </div>
    </>
  )
}

// TODO: <DONE!> implement unique keys with index

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
 *  TODO: Esto es horrible y hay que cambiarlo
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
  analysis: Segment["analysis"]
}) {
  let sentiment
  if (analysis?.sentiment) {
    sentiment = analysis.sentiment
  }
  switch (speaker) {
    case "SPEAKER_00":
      return (
        <>
          {sentiment ? (
            <SentimentMarker sentiment={sentiment as SentimentType} />
          ) : (
            <></>
          )}
          <TextBox text={text} start={start} end={end} />
        </>
      )
    case "SPEAKER_01":
      return (
        <>
          <TextBox text={text} start={start} end={end} />
          {sentiment ? (
            <SentimentMarker sentiment={sentiment as SentimentType} />
          ) : (
            <></>
          )}
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

// converted to component
export function Timestamp({
  start,
  end,
}: {
  start: Segment["start"]
  end: Segment["end"]
}) {
  const startTime = secondsToHMS(start)
  const endTime = secondsToHMS(end)
  return `( ${formatTimestamp(startTime)} - ${formatTimestamp(endTime)} )`
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

export function Emoji({ segment }: { segment: Segment }) {
  return (
    <div className={BASIC_STYLE + "flex-row justify-between items-center"}>
      <div className='text-2xl'>
        {getEmojiForEmotion(segment.analysis.emotion)}
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

export function getEmojiForEmotion(emotion: Segment["analysis"]["emotion"]) {
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

export function secondsToHMS(seconds: number) {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60
  return { hours, minutes, seconds: remainingSeconds }
}

export function formatTimestamp({
  hours,
  minutes,
  seconds,
}: {
  hours: number
  minutes: number
  seconds: number
}) {
  let formattedTime = ""
  if (hours > 0) {
    formattedTime += `${hours}h `
  }
  if (minutes > 0) {
    formattedTime += `${minutes}m `
  }
  formattedTime += `${seconds.toFixed(2)}s`
  return formattedTime.trim()
}

export default TranscriptionClient
