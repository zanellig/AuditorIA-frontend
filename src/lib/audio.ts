import "server-only"
import { promisify } from "util"
import { exec } from "child_process"
import fs from "fs/promises"
import path from "path"
import os from "os"
import { env } from "@/env"
import shellEscape from "shell-escape"

const execAsync = promisify(exec)

export async function getNetworkAudio(
  audioPath: string
): Promise<[Error | null, Buffer | null]> {
  console.log("Starting getNetworkAudio with path:", audioPath)

  const isWindows = os.platform() === "win32"
  if (!isWindows) {
    const smbClientInstalled =
      (await execAsync("which smbclient").catch(() => null)) !== null
    if (!smbClientInstalled) {
      console.log("smbclient not installed")

      return [new Error("smbclient is not installed on this system"), null]
    }
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
    try {
      console.log("Reading file directly from UNC path")
      const audioBuffer = await retryReadFile(audioPath, 3, 5000) // 3 retries with a 5-second delay

      return [null, audioBuffer]
    } catch (err) {
      console.error("Failed to read audio file:", err)

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
    try {
      const username = env.LDAP_USERNAME
      const password = env.LDAP_PASSWORD
      const domain = env.LDAP_DOMAIN

      if (!domain) {
        return [new Error("LDAP domain is not properly configured"), null]
      }

      if (!username || !password) {
        return [new Error("LDAP credentials are not properly configured"), null]
      }

      // Validate audioPath
      const pathParts = audioPath.split(/[/\\]/)
      if (pathParts.length < 4) {
        throw new Error("Invalid network path format")
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
        throw new Error("Retrieved file is empty")
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

      return [
        new Error(
          `Network file retrieval failed: ${
            err instanceof Error ? err.message : String(err)
          }`
        ),
        null,
      ]
    }
  }

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

    return [
      new Error(
        `Failed to read temporary audio file: ${
          err instanceof Error ? err.message : String(err)
        }`
      ),
      null,
    ]
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

  // End of getNetworkAudio
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
