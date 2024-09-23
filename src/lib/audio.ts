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
  const isWindows = os.platform() === "win32"

  if (!isWindows) {
    const smbClientInstalled =
      (await execAsync("which smbclient").catch(() => null)) !== null
    if (!smbClientInstalled) {
      return [new Error("smbclient is not installed on this system"), null]
    }
  }

  // Extract share and file path from the UNC path
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

  // Windows-specific handling
  if (isWindows) {
    const username = process.env.LDAP_USERNAME
    const password = process.env.LDAP_PASSWORD
    const domain = process.env.LDAP_DOMAIN

    if (!username || !password || !domain) {
      return [new Error("LDAP credentials are not properly configured"), null]
    }

    // Construct PowerShell command to mount the SMB share, copy the file, and unmount
    const powershellCommand = `
      $username = '${domain}\\${username}'
      $password = ConvertTo-SecureString '${password}' -AsPlainText -Force
      $credential = New-Object System.Management.Automation.PSCredential($username, $password)
      New-PSDrive -Name 'Z' -PSProvider 'FileSystem' -Root '${sharePath}' -Credential $credential
      Copy-Item 'Z:\\${filePathOnShare}' '${tempFile}'
      Remove-PSDrive -Name 'Z'
    `

    try {
      await execAsync(`powershell.exe -Command "${powershellCommand}"`)
    } catch (err) {
      return [
        new Error(
          `Failed to execute PowerShell command: ${
            err instanceof Error ? err.message : String(err)
          }`
        ),
        null,
      ]
    }
  } else {
    // Linux/macOS smbclient handling
    const username = process.env.LDAP_USERNAME
    const password = process.env.LDAP_PASSWORD
    const domain = process.env.LDAP_DOMAIN

    if (!username || !password || !domain) {
      return [new Error("LDAP credentials are not properly configured"), null]
    }

    const smbCommand = `smbclient ${sharePath} -U ${domain}/${username}%${password} -c "get \\"${filePathOnShare}\\" \\"${tempFile}\\""`

    try {
      await execAsync(smbCommand)
    } catch (err) {
      await fs.rmdir(tempDir).catch(() => {}) // Best effort cleanup
      return [
        new Error(
          `Failed to execute smbclient command: ${
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
  } catch (err) {
    await fs.unlink(tempFile).catch(() => {})
    await fs.rmdir(tempDir).catch(() => {})
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

  return [null, audioBuffer]
}
