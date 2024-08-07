import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import {
  Segment,
  EmotionMedian,
  SentimentMedian,
  HateSpeechMedian,
  EmotionValues,
  HateValues,
  SentimentValues,
  Medians,
} from "@/lib/types.d"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function obtenerMesLocale(mes: number): string {
  const meses = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ]
  return meses[mes]
}

export function secondsToHMS(seconds: number) {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60
  return { hours, minutes, seconds: remainingSeconds }
}

export function formatTimestamp(
  {
    hours,
    minutes,
    seconds,
  }: {
    hours: number
    minutes: number
    seconds: number
  },
  concat: boolean
) {
  let formattedTime = ""
  if (hours > 0) {
    formattedTime += `${hours}h `
  }
  if (minutes > 0) {
    formattedTime += `${minutes}m `
  }
  if (Number(seconds.toFixed(0)) > 0) {
    formattedTime += `${concat ? seconds.toFixed(0) : seconds.toFixed(2)}s`
  }
  return formattedTime.trim()
}

export const handleCopyToClipboard = (items: string[]) => {
  const textToCopy = items.join(", ")
  if (typeof window !== "undefined" && navigator.clipboard) {
    navigator.clipboard
      .writeText(textToCopy)
      .catch(err => console.error("Failed to copy text to clipboard", err))
  } else {
    console.warn("Clipboard API not supported or not running in client-side")
  }
}

export async function calculateMedianForSegments(
  segments: Segment[]
): Promise<Medians | null> {
  let emotions: EmotionValues = {
    pos: [],
    neu: [],
    neg: [],
  }
  let sentiments: SentimentValues = {
    joy: [],
    fear: [],
    anger: [],
    others: [],
    disgust: [],
  }
  let hate_speech: HateValues = {
    hateful: [],
    targeted: [],
    aggressive: [],
  }
  for (const segment of segments) {
    if (!segment.analysis) return null
    emotions.neg.push(segment.analysis.sentiment_probas.NEG)
    emotions.pos.push(segment.analysis.sentiment_probas.POS)
    emotions.neu.push(segment.analysis.sentiment_probas.NEU)

    sentiments.joy.push(segment.analysis.emotion_probas.joy)
    sentiments.fear.push(segment.analysis.emotion_probas.fear)
    sentiments.anger.push(segment.analysis.emotion_probas.anger)
    sentiments.others.push(segment.analysis.emotion_probas.others)
    sentiments.disgust.push(segment.analysis.emotion_probas.disgust)

    hate_speech.hateful.push(segment.analysis.hate_speech_probas.hateful)
    hate_speech.targeted.push(segment.analysis.hate_speech_probas.targeted)
    hate_speech.aggressive.push(segment.analysis.hate_speech_probas.aggressive)
  }

  let emotionMedian: EmotionMedian
  let sentimentMedian: SentimentMedian
  let hateSpeechMedian: HateSpeechMedian

  emotionMedian = {
    pos: calculateMedian(emotions.pos),
    neu: calculateMedian(emotions.neu),
    neg: calculateMedian(emotions.neg),
  }
  sentimentMedian = {
    joy: calculateMedian(sentiments.joy),
    fear: calculateMedian(sentiments.fear),
    anger: calculateMedian(sentiments.anger),
    others: calculateMedian(sentiments.others),
    disgust: calculateMedian(sentiments.disgust),
  }
  hateSpeechMedian = {
    hateful: calculateMedian(hate_speech.hateful),
    targeted: calculateMedian(hate_speech.targeted),
    aggressive: calculateMedian(hate_speech.aggressive),
  }

  function calculateMedian(array: number[]) {
    array.sort((a, b) => a - b)
    const middle = Math.floor(array.length / 2)
    if (array.length % 2 === 0) {
      return (array[middle - 1] + array[middle]) / 2
    } else {
      return array[middle]
    }
  }

  return {
    emotionMedian,
    sentimentMedian,
    hateSpeechMedian,
  }
}
