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
  } as const

  // Collect parameters
  const params: Partial<SpeechToTextParams> = {}

  // Extract and validate parameters
  Object.entries(paramMapping).forEach(([formKey, schemaKey]) => {
    const value = clientForm.get(formKey)
    if (value) {
      // Type-safe assignment using type assertion
      ;(params as Record<string, unknown>)[schemaKey] = String(value)
    }
  })

  return SpeechToTextParamsSchema.partial().parse(params)
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
