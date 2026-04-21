param(
  [switch]$Start,
  [switch]$Stop,
  [switch]$Status
)

$ErrorActionPreference = "Stop"

$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$PidFile = Join-Path $ProjectRoot ".run-switch.pid"
$LogFile = Join-Path $ProjectRoot "run-switch.log"
$Port = 5173
$HostName = "0.0.0.0"
$LocalUrl = "http://localhost:$Port/"

function Write-Log {
  param([string]$Message)

  $line = "[{0}] {1}" -f (Get-Date -Format "yyyy-MM-dd HH:mm:ss"), $Message
  Add-Content -LiteralPath $LogFile -Value $line -Encoding UTF8
}

function Write-Line {
  param([string]$Message)

  Write-Host $Message
  Write-Log $Message
}

function Get-RecordedPid {
  if (-not (Test-Path -LiteralPath $PidFile)) {
    return $null
  }

  $raw = (Get-Content -LiteralPath $PidFile -Raw).Trim()
  if ($raw -match '^\d+$') {
    return [int]$raw
  }

  return $null
}

function Test-RecordedProcess {
  param([int]$ProcessId)

  try {
    $process = Get-Process -Id $ProcessId -ErrorAction Stop
    return $null -ne $process
  } catch {
    return $false
  }
}

function Test-ToolRuns {
  param(
    [string]$Tool,
    [string[]]$Arguments
  )

  try {
    & $Tool @Arguments | Out-Null
    return $LASTEXITCODE -eq 0
  } catch {
    return $false
  }
}

function Get-NodeRunner {
  $npm = Get-Command npm.cmd -ErrorAction SilentlyContinue
  if ($npm -and (Test-ToolRuns -Tool "npm.cmd" -Arguments @("--version"))) {
    return @{
      Install = "npm install"
      Dev = "npm run dev -- --host $HostName --port $Port"
    }
  }

  $vite = Join-Path $ProjectRoot "node_modules\vite\bin\vite.js"
  if ((Test-ToolRuns -Tool "node.exe" -Arguments @("--version")) -and (Test-Path -LiteralPath $vite)) {
    return @{
      Install = $null
      Dev = "node `"$vite`" --host $HostName --port $Port"
    }
  }

  $dist = Join-Path $ProjectRoot "dist"
  $server = Join-Path $ProjectRoot "static-server.ps1"
  if (Test-Path -LiteralPath (Join-Path $dist "index.html")) {
    return @{
      Install = $null
      Dev = "powershell.exe -NoProfile -ExecutionPolicy Bypass -File `"$server`" -Port $Port -Root `"$dist`""
      Fallback = $true
    }
  }

  return $null
}

function Stop-Project {
  $recordedPid = Get-RecordedPid

  if ($null -eq $recordedPid) {
    Write-Line "No recorded running process was found."
    if (Test-Path -LiteralPath $PidFile) {
      Remove-Item -LiteralPath $PidFile -Force
    }
    return
  }

  if (Test-RecordedProcess -ProcessId $recordedPid) {
    Write-Line "Stopping silk-studio-web, PID: $recordedPid ..."
    & taskkill.exe /PID $recordedPid /T /F | Out-Null
    Write-Line "Stopped."
  } else {
    Write-Line "The recorded process is no longer running."
  }

  if (Test-Path -LiteralPath $PidFile) {
    Remove-Item -LiteralPath $PidFile -Force
  }
}

function Start-Project {
  $recordedPid = Get-RecordedPid

  if ($null -ne $recordedPid -and (Test-RecordedProcess -ProcessId $recordedPid)) {
    Write-Line "Project is already running."
    Write-Line "URL: $LocalUrl"
    Write-Line "Run the switch again to stop it."
    return
  }

  $runner = Get-NodeRunner
  if ($null -eq $runner) {
    throw "Node.js/npm was not found, and no built dist/index.html was found. Install Node.js LTS from https://nodejs.org/ , then run this switch again."
  }

  if (-not (Test-Path -LiteralPath (Join-Path $ProjectRoot "node_modules"))) {
    if (-not $runner.Install) {
      throw "node_modules is missing and npm was not found. Install Node.js LTS from https://nodejs.org/ , then run this switch again."
    }

    Write-Line "node_modules was not found. Installing dependencies..."
    Push-Location $ProjectRoot
    try {
      cmd.exe /c $runner.Install
    } finally {
      Pop-Location
    }
  }

  $command = @"
Set-Location -LiteralPath '$($ProjectRoot.Replace("'", "''"))'
cmd.exe /c $($runner.Dev)
"@

  if ($runner.Fallback) {
    Write-Line "Node.js/npm was not found. Starting the built dist version instead."
  }

  Write-Line "Starting silk-studio-web ..."
  $process = Start-Process -FilePath "powershell.exe" -ArgumentList @(
    "-NoExit",
    "-ExecutionPolicy", "Bypass",
    "-Command", $command
  ) -WorkingDirectory $ProjectRoot -PassThru

  Set-Content -LiteralPath $PidFile -Value $process.Id -Encoding ASCII

  Write-Line "Started, PID: $($process.Id)"
  Write-Line "Local URL: $LocalUrl"
  Write-Line "LAN URL: http://YOUR-PC-IP:$Port/"
  Write-Line "Run the switch again to stop the project."

  Start-Process $LocalUrl | Out-Null
}

function Show-Status {
  $recordedPid = Get-RecordedPid

  if ($null -ne $recordedPid -and (Test-RecordedProcess -ProcessId $recordedPid)) {
    Write-Line "silk-studio-web is running."
    Write-Line "PID: $recordedPid"
    Write-Line "URL: $LocalUrl"
  } else {
    Write-Line "silk-studio-web is not running."
  }
}

try {
  Write-Log "Project root: $ProjectRoot"

  if ($Status) {
    Show-Status
  } elseif ($Start) {
    Start-Project
  } elseif ($Stop) {
    Stop-Project
  } else {
    $recordedPid = Get-RecordedPid
    if ($null -ne $recordedPid -and (Test-RecordedProcess -ProcessId $recordedPid)) {
      Stop-Project
    } else {
      Start-Project
    }
  }
} catch {
  Write-Log "ERROR: $($_.Exception.Message)"
  Write-Host ""
  Write-Host "Run switch failed. See this log file:"
  Write-Host $LogFile
  Write-Host ""
  Write-Host "Most common fix: install Node.js LTS from https://nodejs.org/ and run the switch again."
  Write-Host ""
  Write-Host "Original error:"
  Write-Host $_.Exception.Message
  exit 1
}
