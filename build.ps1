$logFilePath = ".\build-logs.txt"
$ErrorActionPreference="Continue"

# Clear the log file before starting a new build
Clear-Content $logFilePath -ErrorAction SilentlyContinue

# Inform the user that the build process is being logged
Write-Host "Logging build process to $logFilePath..."

try {
    # Redirect both stdout and stderr to the log file, but don't stop on non-blocking errors
    & npm run build *>> $logFilePath

    # Check if the build failed (non-zero exit code)
    if ($LASTEXITCODE -ne 0) {
        throw "Build failed with exit code $LASTEXITCODE"
    }
} catch {
    # Directly append the error message to the log file
    "`nBuild failed: $($_.Exception.Message)`n" | Out-File -Append $logFilePath
    Write-Host "Build failed. See build-logs.txt for details." -ForegroundColor Red
}