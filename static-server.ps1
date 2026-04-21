param(
  [int]$Port = 5173,
  [string]$Root = ""
)

$ErrorActionPreference = "Stop"

if (-not $Root) {
  $Root = Join-Path (Split-Path -Parent $MyInvocation.MyCommand.Path) "dist"
}

$Root = (Resolve-Path -LiteralPath $Root).Path
$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add("http://localhost:$Port/")

function Get-ContentType {
  param([string]$Path)

  switch ([System.IO.Path]::GetExtension($Path).ToLowerInvariant()) {
    ".html" { return "text/html; charset=utf-8" }
    ".js" { return "text/javascript; charset=utf-8" }
    ".mjs" { return "text/javascript; charset=utf-8" }
    ".css" { return "text/css; charset=utf-8" }
    ".json" { return "application/json; charset=utf-8" }
    ".svg" { return "image/svg+xml" }
    ".png" { return "image/png" }
    ".jpg" { return "image/jpeg" }
    ".jpeg" { return "image/jpeg" }
    ".webp" { return "image/webp" }
    ".ico" { return "image/x-icon" }
    ".woff" { return "font/woff" }
    ".woff2" { return "font/woff2" }
    default { return "application/octet-stream" }
  }
}

function Resolve-RequestPath {
  param([string]$RequestPath)

  $relative = [System.Uri]::UnescapeDataString($RequestPath.TrimStart("/"))
  if ([string]::IsNullOrWhiteSpace($relative)) {
    $relative = "index.html"
  }

  $candidate = Join-Path $Root $relative
  if (Test-Path -LiteralPath $candidate -PathType Container) {
    $candidate = Join-Path $candidate "index.html"
  }

  if (-not (Test-Path -LiteralPath $candidate -PathType Leaf)) {
    $candidate = Join-Path $Root "index.html"
  }

  return $candidate
}

try {
  $listener.Start()
  Write-Host "Static server running at http://localhost:$Port/"
  Write-Host "Serving: $Root"
  Write-Host "Close this window or run the switch again to stop it."

  while ($listener.IsListening) {
    $context = $listener.GetContext()
    try {
      $path = Resolve-RequestPath -RequestPath $context.Request.Url.AbsolutePath
      $bytes = [System.IO.File]::ReadAllBytes($path)
      $context.Response.ContentType = Get-ContentType -Path $path
      $context.Response.ContentLength64 = $bytes.Length
      $context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
      $context.Response.OutputStream.Close()
    } catch {
      $message = [System.Text.Encoding]::UTF8.GetBytes("Server error")
      $context.Response.StatusCode = 500
      $context.Response.ContentType = "text/plain; charset=utf-8"
      $context.Response.ContentLength64 = $message.Length
      $context.Response.OutputStream.Write($message, 0, $message.Length)
      $context.Response.OutputStream.Close()
    }
  }
} finally {
  if ($listener.IsListening) {
    $listener.Stop()
  }
  $listener.Close()
}
