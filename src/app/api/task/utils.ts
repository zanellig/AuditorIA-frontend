import { z } from "zod"
import { SpeechToTextParamsSchema, SpeechToTextParams } from "./speech-to-text"

/**
 * Appends validated speech-to-text parameters to a URL
 * @param baseUrl The base URL to append parameters to
 * @param params Partial parameters to validate and append
 * @returns A new URL with validated search parameters
 */
export function appendSpeechToTextParams(
  baseUrl: string | URL,
  params?: Partial<SpeechToTextParams>
): URL {
  // Create a URL object if a string is passed
  const url = baseUrl instanceof URL ? baseUrl : new URL(baseUrl)

  // Validate and parse the input params, using defaults from the schema
  const validatedParams = SpeechToTextParamsSchema.parse(params || {})

  // Iterate through the validated params and append to URL
  Object.entries(validatedParams).forEach(([key, value]) => {
    // Skip undefined values and convert to string
    if (value !== undefined) {
      // Handle array values (like suppress_tokens)
      if (Array.isArray(value)) {
        url.searchParams.append(key, value.join(","))
      } else {
        url.searchParams.append(key, String(value))
      }
    }
  })

  return url
}

/**
 * Extracts and validates speech-to-text parameters from a FormData object
 * with automatic type conversion based on schema
 * @param clientForm The FormData object to extract parameters from
 * @returns Validated partial parameters for speech-to-text
 */
export function extractSpeechToTextParams(
  clientForm: FormData
): Partial<SpeechToTextParams> {
  // Mapping between form keys and schema keys
  const paramMapping = {
    language: "language",
    task_type: "task",
    model: "model",
    device: "device",
    temperature: "temperatures",
  } as const

  // Get the shape of the schema for type detection
  const shape = SpeechToTextParamsSchema.shape

  /**
   * Converts a value to the appropriate type based on the Zod schema
   * @param value The value to convert
   * @param zodType The Zod schema type
   * @returns The converted value
   */
  function convertValueBasedOnSchema(
    value: unknown,
    zodType: z.ZodTypeAny
  ): unknown {
    // Handle null/undefined
    if (value === null || value === undefined) {
      return value
    }

    try {
      // Handle different Zod types
      if (zodType instanceof z.ZodNumber) {
        // For strings, try parsing
        if (typeof value === "string") {
          const trimmedValue = value.trim()
          const parsedValue = Number(trimmedValue)
          console.log("Parsed number:", parsedValue)
          if (!isNaN(parsedValue)) {
            return parsedValue
          }
        }

        // For non-strings, coerce to number
        const num = Number(value)
        if (!isNaN(num)) {
          return num
        }

        // If all conversions fail, return 0 or throw error
        console.warn("Failed to convert value to number:", value)
        return 0
      }

      // Check if it's a number within a union type
      if (zodType instanceof z.ZodUnion) {
        const hasNumberType = zodType._def.options.some(
          opt => opt instanceof z.ZodNumber
        )
        if (hasNumberType && typeof value === "string") {
          const num = Number(value)
          if (!isNaN(num)) {
            return num
          }
        }
      }

      if (zodType instanceof z.ZodBoolean) {
        if (typeof value === "string") {
          const lowercaseValue = value.toLowerCase().trim()
          if (lowercaseValue === "true") return true
          if (lowercaseValue === "false") return false
        }
        return Boolean(value)
      }

      if (zodType instanceof z.ZodArray) {
        if (typeof value === "string") {
          const items = value.split(",").map(item => item.trim())
          return items.map(item =>
            convertValueBasedOnSchema(item, zodType.element)
          )
        }
        return Array.isArray(value) ? value : [value]
      }

      // Let's also check if this is a refined number type
      if (zodType._def.typeName === "ZodNumber") {
        const num = Number(value)
        return isNaN(num) ? 0 : num
      }

      // If no specific type handling, return as string
      return String(value)
    } catch (error) {
      console.error("Type conversion error:", error)
      return value
    }
  }

  // First collect and convert all values
  const rawParams: Record<string, unknown> = {}

  // Extract and convert parameters based on schema types
  Object.entries(paramMapping).forEach(([formKey, schemaKey]) => {
    const value = clientForm.get(formKey)
    console.log(
      "Value for",
      formKey,
      "is",
      value,
      " and schema key is",
      schemaKey
    )
    if (value !== null) {
      // This is because for this schema the type is deeply nested, as it's Default, Nullable, and Optional
      const zodType =
        shape[schemaKey]._def.innerType._def.innerType._def.innerType
      const convertedValue = convertValueBasedOnSchema(value, zodType)
      rawParams[schemaKey] = convertedValue
    }
  })

  console.log("Raw params are", rawParams)

  // Create a preprocessed schema that ensures numeric fields
  const processedSchema = z
    .object(
      Object.entries(shape).reduce(
        (acc, [key, zodType]) => {
          if (zodType instanceof z.ZodNumber) {
            acc[key] = z.preprocess(val => {
              if (typeof val === "string") {
                const num = parseFloat(val)
                return isNaN(num) ? 0 : num
              }
              return val
            }, zodType)
          } else {
            acc[key] = zodType
          }
          return acc
        },
        {} as Record<string, z.ZodTypeAny>
      )
    )
    .partial()
  // Now validate the converted values with the preprocessed schema
  const validatedParams = processedSchema.safeParse(rawParams)

  if (!validatedParams.success) {
    console.error("Validation error:", validatedParams.error)
    throw validatedParams.error
  }

  return validatedParams.data
}

/**
 * Convenience method to enhance a URL with parameters from FormData
 * @param baseUrl The base URL to append parameters to
 * @param clientForm The FormData object to extract parameters from
 * @returns A new URL with validated search parameters
 */
export function enhanceUrlWithSpeechToTextParams(
  baseUrl: string,
  clientForm: FormData
): URL {
  const params = extractSpeechToTextParams(clientForm)
  return appendSpeechToTextParams(baseUrl, params)
}
