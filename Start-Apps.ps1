param([switch]$Stop)
$ErrorActionPreference = 'Stop'
$projectRoot = $PSScriptRoot
$stateDir = Join-Path $projectRoot '.local'
$stateFile = Join-Path $stateDir 'servers.json'

if ($Stop) {
    if (Test-Path -LiteralPath $stateFile) {
        $servers = Get-Content -LiteralPath $stateFile -Raw | ConvertFrom-Json
        foreach ($server in $servers) {
            $process = Get-Process -Id $server.pid -ErrorAction SilentlyContinue
            if ($process -and $process.StartTime.ToUniversalTime().Ticks.ToString() -eq $server.startedTicks) {
                Stop-Process -Id $server.pid
                Write-Host "Stopped $($server.app)."
            }
        }
        Remove-Item -LiteralPath $stateFile
    } else { Write-Host 'No saved local servers to stop.' }
    exit 0
}

$nodeCommand = Get-Command node.exe -ErrorAction SilentlyContinue
if (-not $nodeCommand) { throw 'Install Node.js 22.13+ (Node 24 LTS recommended), then run npm ci in each app folder.' }
$nodeBinary = $nodeCommand.Source
$version = & $nodeBinary -p 'process.versions.node'
if ([version]$version -lt [version]'22.13.0' -or ([version]$version).Major -eq 23) { throw "Node $version is unsupported. Please use Node 22.13+ on the Node 22 line, or Node 24+." }
$apps = @(@{ name = 'chat-app'; port = 5173 }, @{ name = 'photo-gallery'; port = 5174 })
foreach ($app in $apps) {
    $vite = Join-Path $projectRoot "$($app.name)\node_modules\vite\bin\vite.js"
    if (-not (Test-Path -LiteralPath $vite)) { throw "Run npm ci in $($app.name) before starting." }
    $listener = Get-NetTCPConnection -LocalPort $app.port -State Listen -ErrorAction SilentlyContinue
    if ($listener) { throw "Port $($app.port) is already in use. If these apps are running, open their localhost URLs or use .\Start-Apps.ps1 -Stop first." }
}
New-Item -ItemType Directory -Force -Path $stateDir | Out-Null
$started = @()
try {
    foreach ($app in $apps) {
        $appDir = Join-Path $projectRoot $app.name
        $vite = Join-Path $appDir 'node_modules\vite\bin\vite.js'
        $process = Start-Process -FilePath $nodeBinary -ArgumentList @('"' + $vite + '"') -WorkingDirectory $appDir -WindowStyle Hidden -RedirectStandardOutput (Join-Path $stateDir "$($app.name).log") -RedirectStandardError (Join-Path $stateDir "$($app.name).error.log") -PassThru
        $started += @{ app = $app.name; pid = $process.Id; startedTicks = $process.StartTime.ToUniversalTime().Ticks.ToString() }
    }
    $started | ConvertTo-Json | Set-Content -LiteralPath $stateFile
    foreach ($app in $apps) {
        $ready = $false
        for ($attempt = 0; $attempt -lt 20; $attempt++) {
            try { $response = Invoke-WebRequest -UseBasicParsing -Uri "http://127.0.0.1:$($app.port)" -TimeoutSec 1; $ready = $response.StatusCode -eq 200 } catch { }
            if ($ready) { break }
            Start-Sleep -Milliseconds 250
        }
        if (-not $ready) { throw "$($app.name) did not become ready. Check .local logs." }
        Write-Host "$($app.name): http://127.0.0.1:$($app.port)"
    }
    Write-Host 'Both apps are running in the background. Stop them with: .\Start-Apps.ps1 -Stop'
} catch {
    foreach ($server in $started) { Stop-Process -Id $server.pid -ErrorAction SilentlyContinue }
    if (Test-Path -LiteralPath $stateFile) { Remove-Item -LiteralPath $stateFile }
    throw
}
