import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import {
  Averages,
  Segment,
  EmotionAverage,
  SentimentAverage,
  HateSpeechAverage,
  EmotionValues,
  HateValues,
  SentimentValues,
  Task,
  EmotionsSchema,
} from "@/lib/types"
import { getHost } from "@/lib/actions"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getSpanishEmotion(emotion: string) {
  switch (emotion) {
    case EmotionsSchema.Values.joy:
      return "disfrute"
    case EmotionsSchema.Values.fear:
      return "miedo"
    case EmotionsSchema.Values.anger:
      return "enojo"
    case EmotionsSchema.Values.others:
      return "otros"
    case EmotionsSchema.Values.disgust:
      return "disgust"
    case EmotionsSchema.Values.sadness:
      return "tristeza"
    case EmotionsSchema.Values.surprise:
      return "sorpresa"
    default:
      return "desconocido"
  }
}

export function getColorForEmotion(emotion: string) {
  switch (emotion) {
    case EmotionsSchema.Values.joy:
      return "blue-500"
    case EmotionsSchema.Values.fear:
      return "yellow-500"
    case EmotionsSchema.Values.anger:
      return "red-500"
    case EmotionsSchema.Values.others:
      return "gray-500"
    case EmotionsSchema.Values.disgust:
      return "green-500"
    case EmotionsSchema.Values.sadness:
      return "indigo-500"
    case EmotionsSchema.Values.surprise:
      return "purple-500"
    default:
      return "gray-500"
  }
}

export function getLocaleMonth(mes: number): string {
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
  if (isNaN(seconds)) return { hours: 0, minutes: 0, seconds: 0 }
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60
  return { hours, minutes, seconds: remainingSeconds }
}

export interface TimestampFormatterOptions {
  hours: number
  minutes: number
  seconds: number
  concat?: boolean
}

export function formatTimestamp({
  hours,
  minutes,
  seconds,
  concat = false,
}: TimestampFormatterOptions) {
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

/**
 * Wrapper around the navigator.clipboard.writeText() method to handle copying text to the clipboard
 * @param items The items to copy to the clipboard. Can be a string or an array of strings
 */
export const handleCopyToClipboard = (items: string[] | string) => {
  const textToCopy = typeof items === "string" ? items : items.join(", ")
  if (typeof window !== "undefined" && navigator.clipboard) {
    navigator.clipboard.writeText(textToCopy).catch(err => {
      console.error("Failed to copy text to clipboard", err)
    })
  } else {
    console.warn("Clipboard API not supported or not running in client-side")
  }
}

export async function calculateAverageForSegments(
  segments: Segment[]
): Promise<Averages | null> {
  const emotions: EmotionValues = {
    pos: [],
    neu: [],
    neg: [],
  }
  const sentiments: SentimentValues = {
    joy: [],
    fear: [],
    anger: [],
    others: [],
    disgust: [],
  }
  const hate_speech: HateValues = {
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

  const emotionAverage: EmotionAverage = {
    pos: calculateAverage(emotions.pos),
    neu: calculateAverage(emotions.neu),
    neg: calculateAverage(emotions.neg),
  }
  const sentimentAverage: SentimentAverage = {
    joy: calculateAverage(sentiments.joy),
    fear: calculateAverage(sentiments.fear),
    anger: calculateAverage(sentiments.anger),
    others: calculateAverage(sentiments.others),
    disgust: calculateAverage(sentiments.disgust),
  }
  const hateSpeechAverage: HateSpeechAverage = {
    hateful: calculateAverage(hate_speech.hateful),
    targeted: calculateAverage(hate_speech.targeted),
    aggressive: calculateAverage(hate_speech.aggressive),
  }

  function calculateAverage(array: number[]): number {
    if (array.length === 0) return 0
    const sum = array.reduce((a, b) => a + b, 0)
    return sum / array.length
  }
  return {
    emotionAverage,
    sentimentAverage,
    hateSpeechAverage,
  }
}

export enum AllowedContentTypes {
  Json = "json",
  Form = "form",
  Multipart = "multipart",
}

/**
 * @deprecated
 * @param origin
 * @param contentType
 * @returns
 */
export function getHeaders(
  origin: string,
  contentType?: AllowedContentTypes
): Headers {
  const headers = new Headers()
  switch (contentType) {
    case "json":
      headers.set("Content-Type", "application/json")
      break
    case "form":
      headers.set("Content-Type", "application/x-www-form-urlencoded")
      break
    case "multipart":
      // Don't set Content-Type for multipart/form-data, let the browser set it with the boundary
      break
    default:
      headers.set("Content-Type", "application/json")
  }
  headers.set("Access-Control-Allow-Origin", origin)
  headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
  headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")
  return headers
}

export function normalizeString(input: string): string {
  return _replaceSpecialCharacters(replaceNonASCIIChars(input), "")
}

export function _replaceSpecialCharacters(
  input: string,
  replacement: string
): string {
  // Regular expression to match all special characters
  const specialCharsRegex = /[^a-zA-Z0-9\sáéíóúÁÉÍÓÚ]/g

  // Replace all special characters with the specified replacement string
  const sanitizedString = input.replace(specialCharsRegex, replacement).trim()

  return sanitizedString
}

export function replaceNonASCIIChars(input: string): string {
  return input
    .normalize("NFD") // Decompose accented characters into base + diacritic
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritic marks
}

export function getUniqueWords(segments: Segment[]): Set<string> {
  const wordsSet = new Set<string>()
  for (const segment of segments) {
    let words = segment.text.split(" ")
    words = words.map(word => {
      word = normalizeString(word)
      word = word.toLowerCase()
      word = word.trim()
      return word
    })
    words = words.filter(word => word !== "")
    words.forEach(word => {
      wordsSet.add(word)
    })
  }
  return wordsSet
}

export function extractQueryParamsFromUrl(search: string) {
  // Extract the part of the URL after the "?"
  const queryString = search.split("?")[1] || ""
  const regexToLookForKeyValuePairs = /([^&=?]+)=([^&=?]*)/g
  let match
  const params: Record<string, string>[] = []

  // Iterate over all matches of key-value pairs in the query string
  while ((match = regexToLookForKeyValuePairs.exec(queryString)) !== null) {
    params.push({ [match[1]]: decodeURIComponent(match[2]) })
  }
  return params
}
export function concatParamsToUrlString(
  baseUrl: string,
  params: Record<string, string>[]
) {
  let url = baseUrl
  if (params.length > 0) {
    url +=
      "?" +
      params
        .map(param => {
          const key = Object.keys(param)[0]
          const value = param[key]
          return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
        })
        .join("&")
  }
  return url
}

/**
 * Extracts the year, month, and day from a Date object.
 * @param date The Date object to extract the year, month, and day from
 * @returns A string in the format "YYYYMMDD" representing the extracted year, month, and day
 */
export function extractYearMonthDayFromDate(date: Date): string {
  const year = date.getFullYear().toString().padStart(4, "0")
  const month = (date.getMonth() + 1).toString().padStart(2, "0")
  const day = date.getDate().toString().padStart(2, "0")
  return `${year}${month}${day}`
}

export function capitalizeOnlyFirstLetter(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

/**
 * Extracts JSON from a string that contains a code block with the JSON content.
 * Eg. ```json{"key": "value"}```
 * @param input The input string containing the JSON code block
 * @returns The extracted JSON object or the original input string if no JSON was found
 */
export function extractJsonFromString(
  input: string | undefined
): Record<string, string> | string {
  if (!input) {
    return {}
  }
  const jsonPattern = /```json([\s\S]*?)```/
  const match = input.match(jsonPattern)

  if (match && match[1]) {
    try {
      // Trim whitespace and parse the JSON
      return JSON.parse(match[1].trim())
    } catch (error) {
      throw new Error(`Failed to parse JSON: ${JSON.stringify(error)}`)
    }
  }
  // Return the original input if no JSON was found
  return input
}

export function localizeSpeaker(input: string) {
  if (!input) return input
  const speakerPattern = /^SPEAKER_(\d+)$/
  return input.replace(speakerPattern, "Hablante $1")
}

export function extractSpeakerID(input: string): number | null {
  const speakerPattern = /^SPEAKER_(\d+)$/
  const match = input.match(speakerPattern)
  if (match && match[1]) {
    return parseInt(match[1])
  }
  return null
}

export async function submitForm({
  data,
  path,
}: {
  data: object
  path: string
}) {
  const host = await getHost()
  const url = `${host}${path}`

  const formData = new FormData()
  Object.entries(data).forEach(([key, value]) => {
    if (value instanceof File) {
      formData.append(key, value)
    } else {
      formData.append(key, String(value))
    }
  })

  const response = await fetch(url, {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    throw new Error("Failed to submit")
  }

  return response.json()
}

/**
 * ### USED ON HREF
 * **Don't use this function more than it's needed**. It's only a helper function to centralize the URL building in the task table's hrefs
 */
export function _URLBuilder(task: Task) {
  const taskURL = `/dashboard/transcription?identifier=${task?.identifier}${
    task?.file_name ? `&file_name=${task?.file_name}` : ""
  }`
  return taskURL
}
