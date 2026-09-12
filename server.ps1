param([int]$Port = 8793)

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()
Write-Host "Serving $root at http://localhost:$Port/"

$mime = @{
  ".html" = "text/html; charset=utf-8"
  ".css"  = "text/css"
  ".js"   = "application/javascript"
  ".mp4"  = "video/mp4"
  ".webm" = "video/webm"
  ".png"  = "image/png"
  ".jpg"  = "image/jpeg"
  ".svg"  = "image/svg+xml"
}

while ($listener.IsListening) {
  $context = $listener.GetContext()
  $request = $context.Request
  $response = $context.Response
  $stream = $null
  try {
    $path = [System.Uri]::UnescapeDataString($request.Url.AbsolutePath)
    if ($path -eq "/") { $path = "/index.html" }
    # Netlify と同じく拡張子なしのURLを .html に解決する (/products -> products.html)
    if (-not [System.IO.Path]::HasExtension($path)) {
      $candidate = [System.IO.Path]::GetFullPath((Join-Path $root ($path.TrimStart("/") + ".html")))
      if (Test-Path $candidate -PathType Leaf) { $path = $path + ".html" }
    }
    $filePath = [System.IO.Path]::GetFullPath((Join-Path $root ($path.TrimStart("/"))))

    if (-not $filePath.StartsWith($root)) {
      $response.StatusCode = 403
      $response.Close()
      continue
    }

    if (-not (Test-Path $filePath -PathType Leaf)) {
      $response.StatusCode = 404
      $response.Close()
      continue
    }

    $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
    $contentType = $mime[$ext]
    if (-not $contentType) { $contentType = "application/octet-stream" }
    $response.ContentType = $contentType
    $response.AddHeader("Accept-Ranges", "bytes")
    $response.AddHeader("Cache-Control", "no-store")

    $stream = [System.IO.File]::OpenRead($filePath)
    $length = $stream.Length
    $start = 0
    $end = $length - 1

    # video seeking needs 206 Partial Content
    $range = $request.Headers["Range"]
    if ($range -match "bytes=(\d*)-(\d*)") {
      if ($matches[1] -ne "") { $start = [int64]$matches[1] }
      if ($matches[2] -ne "") { $end = [int64]$matches[2] }
      if ($end -ge $length) { $end = $length - 1 }
      $response.StatusCode = 206
      $response.AddHeader("Content-Range", "bytes $start-$end/$length")
    }

    $remaining = $end - $start + 1
    $response.ContentLength64 = $remaining
    $stream.Position = $start
    $buffer = New-Object byte[] 65536
    while ($remaining -gt 0) {
      $read = $stream.Read($buffer, 0, [Math]::Min($buffer.Length, $remaining))
      if ($read -le 0) { break }
      $response.OutputStream.Write($buffer, 0, $read)
      $remaining -= $read
    }
  } catch {
    try { $response.StatusCode = 500 } catch {}
  } finally {
    # aborted requests throw mid-write, so the handle must be released here
    if ($stream) { try { $stream.Dispose() } catch {} }
    try { $response.Close() } catch {}
  }
}
