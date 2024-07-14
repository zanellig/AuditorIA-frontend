import { TranscriptionType, Segment, SentimentType, Task } from "@/lib/tasks"
import { Button } from "@/components/ui/button"
import { MessageCircleQuestion } from "lucide-react"
import { GLOBAL_ICON_SIZE } from "@/lib/consts"

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
export default function Transcription({
  transcriptionBody,
  UUID,
}: {
  transcriptionBody: TranscriptionType
  UUID: Task["identifier"]
}) {
  function renderAnalysisWithSegment(
    segment: Segment,
    i: number,
    speaker: Segment["speaker"]
  ) {
    return (
      <div className='flex flex-row space-x-2' key={i}>
        {renderBoxesBySpeaker(segment, i, speaker)}
      </div>
    )
  }

  return (
    <>
      <div className='flex flex-col space-y-2 w-full'>
        <div className='text-lg '>
          Transcripción de llamado ID <span className='font-bold'>{UUID}</span>{" "}
        </div>
        {transcriptionBody.result.segments.map((segment: Segment, i) => {
          // console.log(segment.analysis.emotion_probas)
          let speaker = segment.speaker

          return (
            <>
              <div
                className={speaker === "SPEAKER_01" ? "self-end" : "self-start"}
              >
                {renderAnalysisWithSegment(segment, i, speaker)}
              </div>
            </>
          )
        })}
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

export function renderBoxesBySpeaker(
  segment: Segment,
  i: number,
  speaker: Segment["speaker"]
) {
  switch (speaker) {
    case "SPEAKER_00":
      return (
        <>
          <Emoji segment={segment} />
          <TextContainer segment={segment} />
          <EmotionBox segment={segment} />
        </>
      )
    case "SPEAKER_01":
      return (
        <>
          <EmotionBox segment={segment} />
          <TextContainer segment={segment} />
          <Emoji segment={segment} />
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
  const sentiment = analysis.sentiment

  switch (speaker) {
    case "SPEAKER_01":
      return (
        <>
          <TextBox text={text} start={start} end={end} />
          <SentimentMarker sentiment={sentiment} />
        </>
      )
    case "SPEAKER_00":
      return (
        <>
          <SentimentMarker sentiment={sentiment} />
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
  function secondsToHMS(seconds: number) {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60
    return { hours, minutes, seconds: remainingSeconds }
  }

  function formatTimestamp({
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

  function getCallTimestamp(start: Segment["start"], end: Segment["end"]) {
    const startTime = secondsToHMS(start)
    const endTime = secondsToHMS(end)
    return `( ${formatTimestamp(startTime)} - ${formatTimestamp(endTime)} )`
  }

  return (
    <div className='flex flex-col justify-between gap-2'>
      {text}
      <div className='text-xs text-muted-foreground'>
        {getCallTimestamp(start, end)}
      </div>
    </div>
  )
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

export function EmotionBox({ segment }: { segment: Segment }) {
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
