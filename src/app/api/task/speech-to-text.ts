import { z } from "zod"

const LANGUAGES = [
  "en",
  "zh",
  "de",
  "es",
  "ru",
  "ko",
  "fr",
  "ja",
  "pt",
  "tr",
  "pl",
  "ca",
  "nl",
  "ar",
  "sv",
  "it",
  "id",
  "hi",
  "fi",
  "vi",
  "he",
  "uk",
  "el",
  "ms",
  "cs",
  "ro",
  "da",
  "hu",
  "ta",
  "no",
  "th",
  "ur",
  "hr",
  "bg",
  "lt",
  "la",
  "mi",
  "ml",
  "cy",
  "sk",
  "te",
  "fa",
  "lv",
  "bn",
  "sr",
  "az",
  "sl",
  "kn",
  "et",
  "mk",
  "br",
  "eu",
  "is",
  "hy",
  "ne",
  "mn",
  "bs",
  "kk",
  "sq",
  "sw",
  "gl",
  "mr",
  "pa",
  "si",
  "km",
  "sn",
  "yo",
  "so",
  "af",
  "oc",
  "ka",
  "be",
  "tg",
  "sd",
  "gu",
  "am",
  "yi",
  "lo",
  "uz",
  "fo",
  "ht",
  "ps",
  "tk",
  "nn",
  "mt",
  "sa",
  "lb",
  "my",
  "bo",
  "tl",
  "mg",
  "as",
  "tt",
  "haw",
  "ln",
  "ha",
  "ba",
  "jw",
  "su",
  "yue",
] as const

export const SpeechToTextParamsSchema = z.object({
  language: z.enum(LANGUAGES).nullish().default("es"),

  task: z.enum(["transcribe", "translate"]).nullish().default("transcribe"),

  model: z
    .enum([
      "tiny",
      "tiny.en",
      "base",
      "base.en",
      "small",
      "small.en",
      "medium",
      "medium.en",
      "large",
      "large-v1",
      "large-v2",
      "large-v3",
      "distil-large-v2",
    ])
    .nullish()
    .default("large-v3"),

  device: z.enum(["cuda", "cpu"]).nullish().default("cuda"),

  device_index: z.number().int().nullish().default(0),

  threads: z.number().int().nullish().default(0),

  batch_size: z.number().int().nullish().default(8),

  compute_type: z
    .enum(["float16", "int8", "float32"])
    .nullish()
    .default("float16"),

  align_model: z.string().nullish(),

  interpolate_method: z
    .enum(["nearest", "linear", "ignore"])
    .nullish()
    .default("nearest"),

  return_char_alignments: z.boolean().nullish().default(false),

  min_speakers: z.number().int().nullish(),

  max_speakers: z.number().int().nullish(),

  beam_size: z.number().int().nullish().default(5),

  patience: z.number().nullish().default(1),

  length_penalty: z.number().nullish().default(1),

  temperatures: z.number().nullish().default(0),

  compression_ratio_threshold: z.number().nullish().default(2.4),

  log_prob_threshold: z.number().nullish().default(-1),

  no_speech_threshold: z.number().nullish().default(0.6),

  initial_prompt: z.string().nullish(),

  suppress_tokens: z.number().array().nullish().default([-1]),

  suppress_numerals: z.boolean().nullish().default(false),

  vad_onset: z.number().nullish().default(0.5),

  vad_offset: z.number().nullish().default(0.363),
})

export type SpeechToTextParams = z.infer<typeof SpeechToTextParamsSchema>
