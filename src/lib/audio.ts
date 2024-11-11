import "server-only"
import { promisify } from "util"
import { exec } from "child_process"
import fs from "fs/promises"
import path from "path"
import os from "os"
import { env } from "@/env"

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
      const audioBuffer = await retryReadFile(audioPath, 3, 5000) // 3 retries with a 5-second delay
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
  } else if (os.platform() === "linux" || os.platform() === "darwin") {
    console.group("Linux/macOS handling")
    // Linux/macOS smbclient handling
    const username = env.LDAP_USERNAME
    const password = env.LDAP_PASSWORD
    const domain = env.LDAP_DOMAIN
    const [, , server, share, ...filePath] = audioPath.split(/[\/\\]/)
    const sharePath = `//${server}/${share}`
    const filePathOnShare = filePath.join("/")

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
      await fs.rmdir(tempDir).catch(() => {
        console.warn(`Failed to clean up temp directory: ${tempDir}`)
      }) // Best effort cleanup
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
    await fs
      .unlink(tempFile)
      .catch(() => console.warn(`Failed to delete file: ${tempFile}`))
    await fs
      .rmdir(tempDir)
      .catch(() => console.warn(`Failed to delete directory: ${tempDir}`))
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
