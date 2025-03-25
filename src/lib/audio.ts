import "server-only"
import { promisify } from "util"
import { exec } from "child_process"
import fs from "fs/promises"
import path from "path"
import os from "os"
import { env } from "@/env"
import shellEscape from "shell-escape"
import mime from "mime-types"

const execAsync = promisify(exec)

interface AudioFileResult {
  buffer: Buffer | null
  filename: string | null
  mimeType: string | null
  size: number | null
  error: Error | null
}

/**
 * @throws {Error} If the audio file is not found or cannot be read
 * @throws {Error} If the audio file is not a valid audio file
 * @throws {Error} If smbclient is not installed
 */

export async function getNetworkAudio(
  audioPath: string
): Promise<AudioFileResult> {
  console.log("Starting getNetworkAudio with path:", audioPath)

  const result: AudioFileResult = {
    buffer: null,
    filename: null,
    mimeType: null,
    size: null,
    error: null,
  }

  result.filename = path.basename(audioPath)

  const isWindows = os.platform() === "win32"
  if (!isWindows) {
    const smbClientInstalled =
      (await execAsync("which smbclient").catch(() => null)) !== null
    if (!smbClientInstalled) {
      result.error = new Error("smbclient is not installed")
      return result
    }
  }

  // Create a temporary file to store the downloaded audio
  let tempDir: string
  try {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "audio-"))
  } catch (err) {
    result.error = new Error(
      `Failed to create temporary directory: ${
        err instanceof Error ? err.message : String(err)
      }`
    )
    return result
  }

  const tempFile = path.join(tempDir, "temp-audio-file")

  // Platform-specific handling
  if (isWindows) {
    try {
      console.log("Reading file directly from UNC path")
      const audioBuffer = await retryReadFile(audioPath, 3, 5000) // 3 retries with a 5-second delay
      result.buffer = audioBuffer
      result.mimeType =
        mime.lookup(audioPath) ||
        detectAudioMimeType(audioBuffer, result.filename as string)
      result.size = audioBuffer.length
      result.error = null
    } catch (err) {
      console.error("Failed to read audio file:", err)

      result.error = new Error(
        `Failed to read audio file from network path: ${
          err instanceof Error ? err.message : String(err)
        }`
      )

      return result
    }
  } else if (os.platform() === "linux" || os.platform() === "darwin") {
    try {
      const username = env.LDAP_USERNAME
      const password = env.LDAP_PASSWORD
      const domain = env.LDAP_DOMAIN

      if (!domain) {
        result.error = new Error("LDAP domain is not properly configured")
        return result
      }

      if (!username || !password) {
        result.error = new Error("LDAP credentials are not properly configured")
        return result
      }

      // Validate audioPath
      const pathParts = audioPath.split(/[/\\]/)
      if (pathParts.length < 4) {
        result.error = new Error("Invalid network path format")
        return result
      }

      const [, , server, share, ...filePath] = pathParts
      const sharePath = `//${server}/${share}`
      const filePathOnShare = filePath.join("/")

      // Construct smbclient args and use shellEscape
      const smbArgs = [
        "smbclient",
        sharePath,
        "-U",
        `${domain}/${username}%${password}`,
        "-c",
        `get ${filePathOnShare} ${tempFile}`,
      ]

      const smbCommand = shellEscape(smbArgs)
      console.log("Running smbclient command:", smbCommand)

      await Promise.race([
        execAsync(smbCommand, { timeout: 30000 }), // 30-second timeout
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error("smbclient command timed out")),
            30000
          )
        ),
      ])

      // Verify file was actually retrieved
      const stats = await fs.stat(tempFile)
      if (stats.size === 0) {
        result.error = new Error("Retrieved file is empty")
        return result
      }
    } catch (err) {
      console.error("Failed to execute smbclient command:", err)
      console.error("Network share access failed:", err)

      // Cleanup
      try {
        await fs.rm(tempDir, { recursive: true, force: true })
      } catch (cleanupErr) {
        console.warn(`Cleanup failed for directory: ${tempDir}`, cleanupErr)
      }

      result.error = new Error(
        `Network file retrieval failed: ${
          err instanceof Error ? err.message : String(err)
        }`
      )
      return result
    }
  }

  // Read the temporary file
  let audioBuffer: Buffer
  try {
    audioBuffer = await fs.readFile(tempFile)
    console.log("Successfully read temporary file:", audioBuffer)
  } catch (err) {
    console.error("Failed to read temporary file:", err)
    await fs
      .unlink(tempFile)
      .catch(() => console.warn(`Failed to delete file: ${tempFile}`))
    await fs
      .rmdir(tempDir)
      .catch(() => console.warn(`Failed to delete directory: ${tempDir}`))

    result.error = new Error(
      `Failed to read temporary audio file: ${
        err instanceof Error ? err.message : String(err)
      }`
    )
    return result
  }

  // Clean up: delete the temporary file and directory
  try {
    await fs.unlink(tempFile)
    await fs.rmdir(tempDir)
  } catch (err) {
    console.error(
      `Failed to clean up temporary files: ${
        err instanceof Error ? err.message : String(err)
      }`
    )
  }

  console.debug("getNetworkAudio result:", {
    buffer: audioBuffer,
    filename: result.filename,
    mimeType: result.mimeType,
    size: result.size,
    error: result.error,
    isBuffer: audioBuffer instanceof Buffer,
    isArrayBuffer: audioBuffer instanceof ArrayBuffer,
    isUint8Array: audioBuffer instanceof Uint8Array,
    isCustomType:
      typeof audioBuffer === "object" &&
      audioBuffer !== null &&
      "data" in audioBuffer,
  })

  // End of getNetworkAudio
  return {
    buffer: audioBuffer,
    filename: result.filename,
    mimeType: result.mimeType,
    size: result.size,
    error: result.error,
  }
}

async function retryReadFile(
  filePath: string,
  retries = 3,
  delay = 5000
): Promise<Buffer> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`Attempt ${attempt} to read file: ${filePath}`)
      const audioBuffer = await fs.readFile(filePath)
      console.log("Successfully read file")
      return audioBuffer // Return on success
    } catch (err) {
      if (attempt === retries) {
        throw err // If we've exhausted retries, throw the error
      }
      console.log(`Attempt ${attempt} failed. Retrying in ${delay}ms...`)
      await new Promise(resolve => setTimeout(resolve, delay)) // Delay before retrying
    }
  }
  throw new Error("Max retries reached.")
}

// Function to attempt audio MIME type detection from file signature
function detectAudioMimeType(buffer: Buffer, filename: string): string {
  // Try extension first
  const ext = path.extname(filename).toLowerCase()
  const mimeTypeMap: Record<string, string> = {
    ".mp3": "audio/mpeg",
    ".wav": "audio/wav",
    ".ogg": "audio/ogg",
    ".aac": "audio/aac",
    ".flac": "audio/flac",
    ".m4a": "audio/mp4",
    ".webm": "audio/webm",
  }

  if (ext && mimeTypeMap[ext]) {
    return mimeTypeMap[ext]
  }

  // If we have a buffer, we can try to detect by file signature
  if (buffer && buffer.length > 12) {
    // MP3 detection - check for ID3 header or MP3 frame sync
    if (
      (buffer[0] === 0x49 && buffer[1] === 0x44 && buffer[2] === 0x33) || // "ID3"
      (buffer[0] === 0xff && (buffer[1] & 0xe0) === 0xe0) // MP3 frame sync
    ) {
      return "audio/mpeg"
    }

    // WAV detection
    if (
      buffer[0] === 0x52 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46 &&
      buffer[3] === 0x46 && // "RIFF"
      buffer[8] === 0x57 &&
      buffer[9] === 0x41 &&
      buffer[10] === 0x56 &&
      buffer[11] === 0x45 // "WAVE"
    ) {
      return "audio/wav"
    }

    // OGG detection
    if (
      buffer[0] === 0x4f &&
      buffer[1] === 0x67 &&
      buffer[2] === 0x67 &&
      buffer[3] === 0x53 // "OggS"
    ) {
      return "audio/ogg"
    }

    // FLAC detection
    if (
      buffer[0] === 0x66 &&
      buffer[1] === 0x4c &&
      buffer[2] === 0x61 &&
      buffer[3] === 0x43 // "fLaC"
    ) {
      return "audio/flac"
    }
  }

  // Default fallback
  return "audio/octet-stream"
}
