import "server-only"
import { promisify } from "util"
import { exec } from "child_process"
import fs from "fs/promises"
import path from "path"
import os from "os"

const execAsync = promisify(exec)

export async function getNetworkAudio(
  audioPath: string
): Promise<[Error | null, Buffer | null]> {
  console.group("getNetworkAudio")
  console.log("Starting getNetworkAudio with path:", audioPath)

  const isWindows = os.platform() === "win32"
  if (!isWindows) {
    console.group("Non-Windows environment check")
    const smbClientInstalled =
      (await execAsync("which smbclient").catch(() => null)) !== null
    if (!smbClientInstalled) {
      console.log("smbclient not installed")
      console.groupEnd()
      console.groupEnd()
      return [new Error("smbclient is not installed on this system"), null]
    }
    console.groupEnd()
  }

  // Normalize audioPath to split into server/share and file path components
  const [, , server, share, ...filePath] = audioPath.split(/[\/\\]/)
  const sharePath = `//${server}/${share}`
  const filePathOnShare = filePath.join("/")

  // Create a temporary file to store the downloaded audio
  let tempDir: string
  try {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "audio-"))
  } catch (err) {
    return [
      new Error(
        `Failed to create temporary directory: ${
          err instanceof Error ? err.message : String(err)
        }`
      ),
      null,
    ]
  }

  const tempFile = path.join(tempDir, "temp-audio-file")

  // Platform-specific handling
  if (isWindows) {
    console.group("Windows handling")
    try {
      console.log("Reading file directly from UNC path")
      const audioBuffer = await retryReadFile(audioPath, 3, 2000) // 3 retries with a 2-second delay
      console.groupEnd()
      console.groupEnd()
      return [null, audioBuffer]
    } catch (err) {
      console.error("Failed to read audio file:", err)
      console.groupEnd()
      console.groupEnd()
      return [
        new Error(
          `Failed to read audio file from network path: ${
            err instanceof Error ? err.message : String(err)
          }`
        ),
        null,
      ]
    }
  } else {
    console.group("Linux/macOS handling")
    // Linux/macOS smbclient handling
    const username = process.env.LDAP_USERNAME
    const password = process.env.LDAP_PASSWORD
    const domain = process.env.LDAP_DOMAIN

    if (!username || !password || !domain) {
      return [new Error("LDAP credentials are not properly configured"), null]
    }

    // Use smbclient to copy the file from network share
    const smbCommand = `smbclient ${sharePath} -U ${domain}/${username}%${password} -c "get \\"${filePathOnShare}\\" \\"${tempFile}\\""`

    try {
      console.log("Executing smbclient command")
      await execAsync(smbCommand)
    } catch (err) {
      console.error("Failed to execute smbclient command:", err)
      await fs.rmdir(tempDir).catch(() => {}) // Best effort cleanup
      console.groupEnd()
      console.groupEnd()
      return [
        new Error(
          `Failed to execute smbclient command: ${
            err instanceof Error ? err.message : String(err)
          }`
        ),
        null,
      ]
    }
    console.groupEnd()
  }

  console.group("Reading temporary file")
  // Read the temporary file
  let audioBuffer: Buffer
  try {
    audioBuffer = await fs.readFile(tempFile)
    console.log("Successfully read temporary file")
  } catch (err) {
    console.error("Failed to read temporary file:", err)
    await fs.unlink(tempFile).catch(() => {})
    await fs.rmdir(tempDir).catch(() => {})
    console.groupEnd()
    console.groupEnd()
    return [
      new Error(
        `Failed to read temporary audio file: ${
          err instanceof Error ? err.message : String(err)
        }`
      ),
      null,
    ]
  }
  console.groupEnd()

  console.group("Cleanup")
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
  console.groupEnd()

  console.groupEnd() // End of getNetworkAudio
  return [null, audioBuffer]
}

async function retryReadFile(
  filePath: string,
  retries: number = 3,
  delay: number = 1000
): Promise<Buffer> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const audioBuffer = await fs.readFile(filePath)
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
