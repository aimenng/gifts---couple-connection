param(
  [string]$BaseUrl = "http://localhost:8787/api",
  [string]$ExistingEmail = "lili@example.com",
  [string]$ExistingPassword = "Passw0rd!",
  [string]$AltPassword = "Passw0rd!2"
)

$ErrorActionPreference = "Continue"

$NonExistingEmail = "no_user_$([int](Get-Random -Minimum 10000 -Maximum 99999))@example.com"

$results = @()
$token = $null
$usedPassword = $null

function Get-Message {
  param($resp)
  if ($null -ne $resp -and $null -ne $resp.json) {
    if ($null -ne $resp.json.error) { return [string]$resp.json.error }
    if ($null -ne $resp.json.message) { return [string]$resp.json.message }
    if ($null -ne $resp.json.ok) { return ($resp.json | ConvertTo-Json -Compress) }
  }
  return [string]$resp.raw
}

function Invoke-Api {
  param(
    [string]$Method,
    [string]$Url,
    [hashtable]$Headers = $null,
    [object]$Body = $null
  )

  $sw = [System.Diagnostics.Stopwatch]::StartNew()
  $bodyText = $null
  if ($null -ne $Body) {
    $bodyText = $Body | ConvertTo-Json -Depth 10 -Compress
  }

  try {
    if ($null -eq $bodyText) {
      $resp = Invoke-WebRequest -Method $Method -Uri $Url -Headers $Headers -UseBasicParsing -TimeoutSec 20
    } else {
      $resp = Invoke-WebRequest -Method $Method -Uri $Url -Headers $Headers -UseBasicParsing -TimeoutSec 20 -ContentType "application/json" -Body $bodyText
    }
    $sw.Stop()
    $content = [string]$resp.Content
    $json = $null
    try { $json = $content | ConvertFrom-Json -ErrorAction Stop } catch {}
    return [pscustomobject]@{
      status = [int]$resp.StatusCode
      json = $json
      raw = $content
      ms = [math]::Round($sw.Elapsed.TotalMilliseconds, 2)
    }
  } catch {
    $sw.Stop()
    $status = 0
    $raw = ""
    $json = $null
    if ($_.Exception.Response) {
      $er = $_.Exception.Response
      try { $status = [int]$er.StatusCode.value__ } catch {
        try { $status = [int]$er.StatusCode } catch { $status = 0 }
      }
      try {
        $stream = $er.GetResponseStream()
        if ($stream) {
          $reader = New-Object System.IO.StreamReader($stream)
          $raw = $reader.ReadToEnd()
          $reader.Close()
        }
      } catch {
        $raw = $_.Exception.Message
      }
      try { $json = $raw | ConvertFrom-Json -ErrorAction Stop } catch {}
    } else {
      $raw = $_.Exception.Message
    }
    return [pscustomobject]@{
      status = $status
      json = $json
      raw = $raw
      ms = [math]::Round($sw.Elapsed.TotalMilliseconds, 2)
    }
  }
}

function Invoke-Sensitive {
  param(
    [string]$Method,
    [string]$Path,
    [hashtable]$Headers = $null,
    [object]$Body = $null
  )

  $url = "$BaseUrl$Path"
  return Invoke-Api -Method $Method -Url $url -Headers $Headers -Body $Body
}

function Add-Result {
  param(
    [string]$Id,
    [string]$Desc,
    [string]$Expected,
    [object]$Resp,
    [bool]$Pass,
    [string]$Notes = ""
  )

  $script:results += [pscustomobject]@{
    id = $Id
    desc = $Desc
    expected = $Expected
    pass = $Pass
    status = if ($null -ne $Resp) { $Resp.status } else { "" }
    latency_ms = if ($null -ne $Resp) { $Resp.ms } else { "" }
    message = if ($null -ne $Resp) { Get-Message $Resp } else { "" }
    notes = $Notes
  }
}

Write-Host "[run] BaseUrl=$BaseUrl ExistingEmail=$ExistingEmail NonExistingEmail=$NonExistingEmail"

# T01
$r1 = Invoke-Api -Method "GET" -Url "$BaseUrl/health"
Add-Result -Id "T01" -Desc "Health Check" -Expected "200 + ok=true" -Resp $r1 -Pass ($r1.status -eq 200 -and $r1.json.ok -eq $true)

# T02
$r2a = Invoke-Sensitive -Method "POST" -Path "/auth/register/request-code" -Body @{ email = $ExistingEmail; password = $ExistingPassword }
Add-Result -Id "T02a" -Desc "Register request code (existing)" -Expected "200 + generic message" -Resp $r2a -Pass ($r2a.status -eq 200 -and -not [string]::IsNullOrWhiteSpace((Get-Message $r2a)))

$r2b = Invoke-Sensitive -Method "POST" -Path "/auth/register/request-code" -Body @{ email = $NonExistingEmail; password = $ExistingPassword }
$t02MsgEqual = ((Get-Message $r2a) -eq (Get-Message $r2b))
Add-Result -Id "T02b" -Desc "Register request code (non-existing)" -Expected "200 + generic message" -Resp $r2b -Pass ($r2b.status -eq 200 -and -not [string]::IsNullOrWhiteSpace((Get-Message $r2b)) -and $t02MsgEqual) -Notes ("msgEqualWithT02a=" + $t02MsgEqual)

$r2c = Invoke-Sensitive -Method "POST" -Path "/auth/register/request-code" -Body @{ email = $ExistingEmail; password = $ExistingPassword }
Add-Result -Id "T02c" -Desc "Register request code cooldown" -Expected "429" -Resp $r2c -Pass ($r2c.status -eq 429)

# T03
$r3 = Invoke-Sensitive -Method "POST" -Path "/auth/register/verify" -Body @{ email = $NonExistingEmail; code = "000000" }
Add-Result -Id "T03" -Desc "Register verify wrong code" -Expected "400 + unified verify error" -Resp $r3 -Pass ($r3.status -eq 400)

# Cooldown reset for sensitive limiter
Start-Sleep -Seconds 65

# T04
$r4a = Invoke-Sensitive -Method "POST" -Path "/auth/password/request-reset-code" -Body @{ email = $ExistingEmail }
Add-Result -Id "T04a" -Desc "Reset request code (existing)" -Expected "200 + generic message" -Resp $r4a -Pass ($r4a.status -eq 200 -and -not [string]::IsNullOrWhiteSpace((Get-Message $r4a)))

$r4b = Invoke-Sensitive -Method "POST" -Path "/auth/password/request-reset-code" -Body @{ email = $NonExistingEmail }
$t04MsgEqual = ((Get-Message $r4a) -eq (Get-Message $r4b))
Add-Result -Id "T04b" -Desc "Reset request code (non-existing)" -Expected "200 + generic message" -Resp $r4b -Pass ($r4b.status -eq 200 -and -not [string]::IsNullOrWhiteSpace((Get-Message $r4b)) -and $t04MsgEqual) -Notes ("msgEqualWithT04a=" + $t04MsgEqual)

$r4c = Invoke-Sensitive -Method "POST" -Path "/auth/password/request-reset-code" -Body @{ email = $ExistingEmail }
Add-Result -Id "T04c" -Desc "Reset request code cooldown" -Expected "429" -Resp $r4c -Pass ($r4c.status -eq 429)

# T05
$r5 = Invoke-Sensitive -Method "POST" -Path "/auth/password/reset" -Body @{ email = $ExistingEmail; code = "000000"; newPassword = "TmpPass123!" }
Add-Result -Id "T05" -Desc "Reset wrong code" -Expected "400 + unified verify error" -Resp $r5 -Pass ($r5.status -eq 400)

# Cooldown reset for sensitive limiter
Start-Sleep -Seconds 65

# T06
$r6 = Invoke-Sensitive -Method "POST" -Path "/auth/login" -Body @{ email = $ExistingEmail; password = "WrongPass123!" }
Add-Result -Id "T06" -Desc "Login wrong credentials" -Expected "401" -Resp $r6 -Pass ($r6.status -eq 401)

# T07
$r7a = Invoke-Sensitive -Method "POST" -Path "/auth/login" -Body @{ email = $ExistingEmail; password = $ExistingPassword }
if ($r7a.status -eq 200 -and $r7a.json.token) {
  $token = [string]$r7a.json.token
  $usedPassword = $ExistingPassword
} else {
  $r7a2 = Invoke-Sensitive -Method "POST" -Path "/auth/login" -Body @{ email = $ExistingEmail; password = $AltPassword }
  if ($r7a2.status -eq 200 -and $r7a2.json.token) {
    $r7a = $r7a2
    $token = [string]$r7a2.json.token
    $usedPassword = $AltPassword
  }
}
$loginNotes = "login failed"
if ($usedPassword) { $loginNotes = "usedPassword=$usedPassword" }
Add-Result -Id "T07a" -Desc "Login success" -Expected "200 + token" -Resp $r7a -Pass ($r7a.status -eq 200 -and $null -ne $token) -Notes $loginNotes

if ($token) {
  $r7b = Invoke-Api -Method "GET" -Url "$BaseUrl/auth/me" -Headers @{ Authorization = "Bearer $token" }
  Add-Result -Id "T07b" -Desc "Auth me with token" -Expected "200 + user payload" -Resp $r7b -Pass ($r7b.status -eq 200 -and $null -ne $r7b.json.user)
} else {
  Add-Result -Id "T07b" -Desc "Auth me with token" -Expected "200 + user payload" -Resp $null -Pass $false -Notes "Skipped: no token from T07a"
}

# T08 (manual OTP required)
Add-Result -Id "T08a" -Desc "Password reset with real OTP" -Expected "200" -Resp $null -Pass $false -Notes "Manual: need OTP from email"
Add-Result -Id "T08b" -Desc "Old token revoked after reset" -Expected "401" -Resp $null -Pass $false -Notes "Manual: depends on T08a"
Add-Result -Id "T08c" -Desc "Login with new password" -Expected "200 + token" -Resp $null -Pass $false -Notes "Manual: depends on T08a"

# T09
if ($token) {
  $r9a = Invoke-Api -Method "POST" -Url "$BaseUrl/memories" -Headers @{ Authorization = "Bearer $token" } -Body @{ title = "t"; date = "2026-02-11"; image = "data:image/png;base64,aGVsbG8="; rotation = "rotate-999" }
  Add-Result -Id "T09a" -Desc "Memories input validation" -Expected "400" -Resp $r9a -Pass ($r9a.status -eq 400)

  $r9b = Invoke-Api -Method "POST" -Url "$BaseUrl/events" -Headers @{ Authorization = "Bearer $token" } -Body @{ title = "x"; subtitle = "y"; date = "11-02-2026"; type = "anniversary" }
  Add-Result -Id "T09b" -Desc "Events input validation" -Expected "400" -Resp $r9b -Pass ($r9b.status -eq 400)
} else {
  Add-Result -Id "T09a" -Desc "Memories input validation" -Expected "400" -Resp $null -Pass $false -Notes "Skipped: no token"
  Add-Result -Id "T09b" -Desc "Events input validation" -Expected "400" -Resp $null -Pass $false -Notes "Skipped: no token"
}

# T10
$delta = [math]::Abs(($r4a.ms - $r4b.ms))
Add-Result -Id "T10" -Desc "Optional latency spot check" -Expected "delta < 400ms" -Resp $r4a -Pass ($delta -lt 400) -Notes "nonExistMs=$($r4b.ms), deltaMs=$([math]::Round($delta,2))"

$outputPath = Join-Path (Resolve-Path (Join-Path $PSScriptRoot "..")).Path "tmp_regression_results.json"
$results | ConvertTo-Json -Depth 6 | Set-Content -Path $outputPath -Encoding UTF8
($results | Format-Table -AutoSize | Out-String) | Write-Output
Write-Output ("[saved] " + $outputPath)
