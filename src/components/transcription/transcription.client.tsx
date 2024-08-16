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
import SpeakerAnalysis from "./speaker-analysis.server"

interface TranscriptionClientProps {
  transcription: TranscriptionType
  taskId: Task["identifier"]
}
const BASIC_STYLE = "flex text-sm rounded-md p-2 gap-2"

const TranscriptionClient: React.FC<TranscriptionClientProps> = ({
  transcription,
  taskId,
}) => {
  const { toast } = useToast()
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
      <SpeakerAnalysis />
      <div className='flex flex-col space-y-2 py-10 pl-4 pr-16'>
        <TaskHeader taskId={taskId} toast={toast} />
        <Analysis transcription={transcription} />
        {transcription?.result?.segments.map((segment, index) => (
          <SegmentRenderer
            key={`${segment.speaker}-segment-${index}`}
            segment={segment}
          />
        ))}
      </div>
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
  status: Status
}

const TranscriptionNotReady: React.FC<TranscriptionNotReadyProps> = ({
  status,
}) => (
  <Drawer open={true}>
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
          <Link href='/dashboard'>
            <Button variant='outline' className='w-full'>
              <ChevronLeft /> Volver al dashboard
            </Button>
          </Link>
        </DrawerClose>
      </DrawerFooter>
    </DrawerContent>
  </Drawer>
)

interface SentimentMarkerProps {
  sentiment: SentimentType
}

const SentimentMarker: React.FC<SentimentMarkerProps> = ({ sentiment }) => (
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

interface TextBoxProps {
  text: string
  start: number
  end: number
}

const TextBox: React.FC<TextBoxProps> = ({ text, start, end }) => (
  <div className='flex flex-col justify-between gap-2 text-sm'>
    {text}
    <div className='text-xs text-muted-foreground'>
      ({formatTimestamp(secondsToHMS(start), false)} -{" "}
      {formatTimestamp(secondsToHMS(end), false)})
    </div>
  </div>
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
  const speakerNumber = parseInt(segment.speaker.split("_")[1], 10)
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
      "text-wrap max-w-[500px] flex-row justify-between outline outline-1 outline-muted bg-popover",
      BASIC_STYLE
    )}
  >
    {segment.analysis?.sentiment && (
      <SentimentMarker sentiment={segment.analysis.sentiment} />
    )}
    <TextBox text={segment.text} start={segment.start} end={segment.end} />
  </div>
)

export default TranscriptionClient

// "use client"

// import Link from "next/link"

// import {
//   Segment,
//   SentimentType,
//   TranscriptionType,
//   Task,
//   Status,
//   SegmentAnalysisProperties,
// } from "@/lib/types.d"

// import { Button } from "@/components/ui/button"
// import {
//   Drawer,
//   DrawerTrigger,
//   DrawerContent,
//   DrawerClose,
//   DrawerHeader,
//   DrawerFooter,
//   DrawerTitle,
// } from "@/components/ui/drawer"
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipProvider,
//   TooltipTrigger,
// } from "@/components/ui/tooltip"
// import { useToast } from "@/components/ui/use-toast"

// import { ChevronLeft, ClipboardIcon, MessageCircleQuestion } from "lucide-react"

// import {
//   GLOBAL_ICON_SIZE,
//   NEGATIVE_SENTIMENT_COLOR,
//   NEUTRAL_SENTIMENT_COLOR,
//   POSITIVE_SENTIMENT_COLOR,
// } from "@/lib/consts"
// import { cn, secondsToHMS, formatTimestamp } from "@/lib/utils"

// import TitleH1 from "@/components/typography/titleH1"
// import SubtitleH2 from "@/components/typography/subtitleH2"

// import Analysis from "@/components/transcription/analysis"
// import SpeakerAnalysis from "./speaker-analysis.server"

// interface TranscriptionClientProps {
//   transcription: TranscriptionType
//   taskId: Task["identifier"]
// }

// const BASIC_STYLE = " flex text-sm rounded-md p-2 gap-2 "

// const TranscriptionClient = ({
//   transcription,
//   taskId,
// }: TranscriptionClientProps) => {
//   const { toast } = useToast()

//   function renderAnalysisWithSegment(
//     segment: Segment,
//     speaker: Segment["speaker"]
//   ) {
//     return (
//       <div className='flex flex-row space-x-2'>
//         {renderBoxesBySpeaker(segment, speaker)}
//       </div>
//     )
//   }

//   const isAnalysisNotReady = [
//     Status.Pending,
//     Status.Processing,
//     Status.Failed,
//   ].includes(transcription.status)

//   return (
//     <>
//       {isAnalysisNotReady && (
//         <TranscriptionNotReady status={transcription.status} />
//       )}
//       <SpeakerAnalysis />
//       <div className={cn("flex flex-col space-y-2 py-10 pl-4 pr-16")}>
//         <div className='flex flex-row items-center space-x-4 self-center'>
//           <SubtitleH2>
//             Transcripción de llamado con ID
//             <span className='font-bold'> {taskId}</span>
//           </SubtitleH2>
//           <Tooltip>
//             <TooltipProvider>
//               <TooltipTrigger asChild>
//                 <Button
//                   variant='outline'
//                   onClick={() => {
//                     toast({ title: "Se copió el ID", description: taskId })
//                     navigator.clipboard.writeText(taskId)
//                   }}
//                 >
//                   <ClipboardIcon size={GLOBAL_ICON_SIZE} />
//                 </Button>
//               </TooltipTrigger>
//             </TooltipProvider>
//             <TooltipContent>Copiar ID</TooltipContent>
//           </Tooltip>
//         </div>
//         <Analysis transcription={transcription} />

//         {transcription?.result?.segments.map((segment: Segment, i: number) => {
//           let speaker = segment.speaker
//           if (speaker) {
//             return (
//               <div
//                 key={`${speaker}-segment-${i}`}
//                 className={speaker === "SPEAKER_01" ? "self-end" : "self-start"}
//               >
//                 {renderAnalysisWithSegment(segment, speaker)}
//               </div>
//             )
//           }
//           return null
//         })}
//       </div>
//       {/* BUTTON FOR DEV ONLY, DELETE ONCE DONE */}
//     </>
//   )
// }

// export function TranscriptionNotReady({ status }: { status: Status }) {
//   if (status === "failed" || "pending" || "processing") {
//     return (
//       <Drawer open={true}>
//         <DrawerTrigger />
//         <DrawerContent className='focus:border focus:outline-none'>
//           <DrawerHeader>
//             <DrawerTitle className='mx-auto'>
//               <TitleH1>
//                 Esta tarea{" "}
//                 {status === "failed"
//                   ? "falló"
//                   : "no está lista para ser visualizada"}
//                 .
//               </TitleH1>
//             </DrawerTitle>
//           </DrawerHeader>
//           <DrawerFooter>
//             <DrawerClose asChild>
//               <Link href={"/dashboard"}>
//                 <Button variant='outline' className='w-full'>
//                   <ChevronLeft /> Volver al dashboard
//                 </Button>
//               </Link>
//             </DrawerClose>
//           </DrawerFooter>
//         </DrawerContent>
//       </Drawer>
//     )
//   }
// }
// /**
//  * joy -> 😀
//  * fear -> 😱
//  * anger -> 😡
//  * others -> 😐
//  * sadness -> 😢
//  * disgust -> 🤢
//  * surprise -> 😮
//  */

// /**
//  *  FIXME: Esto es horrible y hay que cambiarlo
//  */
// export function renderBoxesBySpeaker(
//   segment: Segment,
//   speaker: Segment["speaker"]
// ) {
//   switch (speaker) {
//     case "SPEAKER_00":
//       return (
//         <>
//           {segment.analysis ? <Emoji segment={segment} /> : null}
//           <TextContainer segment={segment} />
//           {segment.analysis ? <EmotionBox /> : null}
//         </>
//       )
//     case "SPEAKER_01":
//       return (
//         <>
//           {segment.analysis ? <EmotionBox /> : null}
//           <TextContainer segment={segment} />
//           {segment.analysis ? <Emoji segment={segment} /> : null}
//         </>
//       )
//     default:
//       return <TextContainer segment={segment} />
//   }
// }

// export function SentimentMarker({ sentiment }: { sentiment: SentimentType }) {
//   return (
//     <div
//       className={cn(
//         sentimentStyle(sentiment),
//         "inline-block w-1 min-w-1 h-full rounded-md p-0.5"
//       )}
//     ></div>
//   )
// }
// function sentimentStyle(sentiment: SentimentType) {
//   switch (sentiment) {
//     case "POS":
//       return "bg-success"
//     case "NEU":
//       return "bg-yellow-500"
//     case "NEG":
//       return "bg-destructive"
//   }
// }

// export function ChatBox({
//   text,
//   speaker,
//   start,
//   end,
//   analysis,
// }: {
//   text: Segment["text"]
//   speaker: Segment["speaker"]
//   start: Segment["start"]
//   end: Segment["end"]
//   analysis?: Segment["analysis"]
// }) {
//   let sentiment
//   if (analysis?.sentiment) {
//     sentiment = analysis.sentiment
//   } else return null
//   switch (speaker) {
//     case "SPEAKER_00":
//       return (
//         <>
//           {sentiment && (
//             <SentimentMarker sentiment={sentiment as SentimentType} />
//           )}
//           <TextBox text={text} start={start} end={end} />
//         </>
//       )
//     case "SPEAKER_01":
//       return (
//         <>
//           <TextBox text={text} start={start} end={end} />
//           {sentiment && (
//             <SentimentMarker sentiment={sentiment as SentimentType} />
//           )}
//         </>
//       )

//     default:
//       return (
//         <>
//           {sentiment && (
//             <SentimentMarker sentiment={sentiment as SentimentType} />
//           )}
//           <TextBox text={text} start={start} end={end} />
//         </>
//       )
//   }
// }

// export function TextBox({
//   text,
//   start,
//   end,
// }: {
//   text: Segment["text"]
//   start: Segment["start"]
//   end: Segment["end"]
// }) {
//   return (
//     <div className='flex flex-col justify-between gap-2 text-sm'>
//       {text}
//       <div className='text-xs text-muted-foreground'>
//         <Timestamp {...{ start: start, end: end }} />
//       </div>
//     </div>
//   )
// }

// export function Timestamp({
//   start,
//   end,
// }: {
//   start: Segment["start"]
//   end: Segment["end"]
// }) {
//   const startTime = secondsToHMS(start)
//   const endTime = secondsToHMS(end)
//   return `( ${formatTimestamp(startTime, false)} - ${formatTimestamp(
//     endTime,
//     false
//   )} )`
// }

// export function Emoji({ segment }: { segment: Segment }) {
//   return (
//     <div className={BASIC_STYLE + "flex-row justify-between items-center"}>
//       <span className='text-3xl' role='img'>
//         {getEmojiForEmotion(segment.analysis?.emotion)}
//       </span>
//     </div>
//   )
// }

// export function EmotionBox() {
//   return (
//     <div className={BASIC_STYLE + "flex-row justify-between items-center"}>
//       <Button variant='outline' className='w-fit p-2'>
//         <MessageCircleQuestion size={GLOBAL_ICON_SIZE} />
//       </Button>
//     </div>
//   )
// }

// export function TextContainer({ segment }: { segment: Segment }) {
//   return (
//     <div
//       className={
//         "text-wrap max-w-[500px] flex-row justify-between outline outline-1 outline-muted bg-popover" +
//         BASIC_STYLE
//       }
//     >
//       <ChatBox {...segment} />
//     </div>
//   )
// }

// export function getEmojiForEmotion(
//   emotion?: SegmentAnalysisProperties["emotion"]
// ) {
//   let emoji = ""

//   switch (emotion) {
//     case "joy":
//       emoji = "😀"
//       break
//     case "fear":
//       emoji = "😱"
//       break
//     case "anger":
//       emoji = "😡"
//       break
//     case "others":
//       emoji = "😐"
//       break
//     case "sadness":
//       emoji = "😢"
//       break
//     case "disgust":
//       emoji = "🤢"
//       break
//     case "surprise":
//       emoji = "😮"
//       break
//   }

//   return emoji
// }

// export default TranscriptionClient
