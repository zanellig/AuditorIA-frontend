import { z } from "zod"

// Define supported languages and locales
const SupportedLanguage = z.enum([
  "en",
  "es",
  "fr",
  "de",
  "it",
  "pt",
  "ru",
  "zh",
  "ja",
  "ko",
  "ar",
  "hi",
  "nl",
  "sv",
  "pl",
  "tr",
  "vi",
  "th",
  "id",
  "el",
])
type SupportedLanguage = z.infer<typeof SupportedLanguage>

const SupportedLocale = z.enum(["en", "es"])
type SupportedLocale = z.infer<typeof SupportedLocale>

// Define the structure of language names
const LanguageNamesSchema = z.record(SupportedLanguage, z.string())
type LanguageNames = z.infer<typeof LanguageNamesSchema>

// Define the structure of the entire language names object
const LanguageNamesObjectSchema = z.record(SupportedLocale, LanguageNamesSchema)
type LanguageNamesObject = z.infer<typeof LanguageNamesObjectSchema>

class LanguageManager {
  private languageNames: LanguageNamesObject

  constructor() {
    this.languageNames = {
      en: {
        en: "English",
        es: "Spanish",
        fr: "French",
        de: "German",
        it: "Italian",
        pt: "Portuguese",
        ru: "Russian",
        zh: "Chinese",
        ja: "Japanese",
        ko: "Korean",
        ar: "Arabic",
        hi: "Hindi",
        nl: "Dutch",
        sv: "Swedish",
        pl: "Polish",
        tr: "Turkish",
        vi: "Vietnamese",
        th: "Thai",
        id: "Indonesian",
        el: "Greek",
      },
      es: {
        en: "Inglés",
        es: "Español",
        fr: "Francés",
        de: "Alemán",
        it: "Italiano",
        pt: "Portugués",
        ru: "Ruso",
        zh: "Chino",
        ja: "Japonés",
        ko: "Coreano",
        ar: "Árabe",
        hi: "Hindi",
        nl: "Neerlandés",
        sv: "Sueco",
        pl: "Polaco",
        tr: "Turco",
        vi: "Vietnamita",
        th: "Tailandés",
        id: "Indonesio",
        el: "Griego",
      },
    }

    // Validate the initial data
    const validationResult = LanguageNamesObjectSchema.safeParse(
      this.languageNames
    )
    if (!validationResult.success) {
      throw new Error("Initial language data is invalid")
    }
  }

  getLanguageName(code: string, config: { locale?: string } = {}): string {
    // Default to 'en' locale if not provided, normalize inputs
    const locale = SupportedLocale.parse(config.locale?.toLowerCase() || "en")
    const normalizedCode = SupportedLanguage.safeParse(code.toLowerCase())

    if (!normalizedCode.success) {
      throw new Error(`Unsupported language code: ${code}`)
    }

    const localeNames = this.languageNames[locale]
    if (!localeNames) {
      throw new Error(`Unsupported locale: ${locale}`)
    }

    const languageName = localeNames[normalizedCode.data]
    if (!languageName) {
      throw new Error(`Unsupported language code: ${normalizedCode.data}`)
    }

    return languageName
  }

  addLanguage(
    code: string,
    names: Partial<Record<SupportedLocale, string>>
  ): void {
    const normalizedCode = SupportedLanguage.safeParse(code.toLowerCase())

    if (!normalizedCode.success) {
      throw new Error(`Unsupported language code: ${code}`)
    }

    // Validate names to prevent partial failures
    const validNames: Partial<Record<SupportedLocale, string>> = {}

    for (const [locale, name] of Object.entries(names)) {
      const validLocale = SupportedLocale.safeParse(locale.toLowerCase())
      if (!validLocale.success) {
        throw new Error(`Unsupported locale: ${locale}`)
      }

      if (typeof name !== "string" || name.trim() === "") {
        throw new Error(`Invalid name for locale: ${locale}`)
      }

      validNames[validLocale.data] = name
    }

    // Only update if all inputs are valid
    for (const [locale, name] of Object.entries(validNames)) {
      if (name) {
        this.languageNames[locale as SupportedLocale]![normalizedCode.data] =
          name
      }
    }

    // Validate the updated data
    const validationResult = LanguageNamesObjectSchema.safeParse(
      this.languageNames
    )
    if (!validationResult.success) {
      throw new Error("Failed to validate language names after update")
    }
  }
}

const m = new LanguageManager()
export default m
