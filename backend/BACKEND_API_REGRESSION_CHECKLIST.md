# Backend API Regression Checklist

## 1. Prerequisites
- Backend is running: `npm run dev:backend`
- Supabase schema is up to date (including `backend/supabase/migration_20260211_token_version.sql`)
- Test accounts are available (for example from `backend/supabase/seed_test.sql`)

## 2. PowerShell Setup
```powershell
$BASE = "http://localhost:8787/api"
$EMAIL_EXIST = "lili@example.com"
$EMAIL_NOT_EXIST = ("no_user_" + (Get-Random) + "@example.com")
$PASS = "Passw0rd!"
$NEW_PASS = "Passw0rd!2"
```

## 3. Quick Smoke Cases

### T01 Health Check
```powershell
Invoke-RestMethod -Method GET "$BASE/health"
```
Expected:
- `ok = true`

### T02 Register Request Code (anti-enumeration + cooldown)
```powershell
Invoke-RestMethod -Method POST "$BASE/auth/register/request-code" -ContentType "application/json" -Body (@{ email=$EMAIL_EXIST; password=$PASS } | ConvertTo-Json)
Invoke-RestMethod -Method POST "$BASE/auth/register/request-code" -ContentType "application/json" -Body (@{ email=$EMAIL_NOT_EXIST; password=$PASS } | ConvertTo-Json)
```
Expected:
- Both return `200`
- Both return similar generic `message`

Immediately call once more for same email:
```powershell
Invoke-RestMethod -Method POST "$BASE/auth/register/request-code" -ContentType "application/json" -Body (@{ email=$EMAIL_EXIST; password=$PASS } | ConvertTo-Json)
```
Expected:
- `429` with unified text about high frequency

### T03 Register Verify Wrong Code (unified error text)
```powershell
try {
  Invoke-RestMethod -Method POST "$BASE/auth/register/verify" -ContentType "application/json" -Body (@{ email=$EMAIL_NOT_EXIST; code="000000" } | ConvertTo-Json)
} catch {
  $_.Exception.Response.StatusCode.value__
  (New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())).ReadToEnd()
}
```
Expected:
- `400`
- Generic verify failure text (no detailed reason disclosure)

### T04 Password Reset Request Code (anti-enumeration + cooldown)
```powershell
Invoke-RestMethod -Method POST "$BASE/auth/password/request-reset-code" -ContentType "application/json" -Body (@{ email=$EMAIL_EXIST } | ConvertTo-Json)
Invoke-RestMethod -Method POST "$BASE/auth/password/request-reset-code" -ContentType "application/json" -Body (@{ email=$EMAIL_NOT_EXIST } | ConvertTo-Json)
```
Expected:
- Both return `200`
- Both return same generic `message`

Immediate repeat:
```powershell
Invoke-RestMethod -Method POST "$BASE/auth/password/request-reset-code" -ContentType "application/json" -Body (@{ email=$EMAIL_EXIST } | ConvertTo-Json)
```
Expected:
- `429` with unified text about high frequency

### T05 Password Reset Wrong Code (unified error text)
```powershell
try {
  Invoke-RestMethod -Method POST "$BASE/auth/password/reset" -ContentType "application/json" -Body (@{ email=$EMAIL_EXIST; code="000000"; newPassword=$NEW_PASS } | ConvertTo-Json)
} catch {
  $_.Exception.Response.StatusCode.value__
  (New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())).ReadToEnd()
}
```
Expected:
- `400`
- Generic verify failure text

### T06 Login Wrong Credentials (unified auth error)
```powershell
try {
  Invoke-RestMethod -Method POST "$BASE/auth/login" -ContentType "application/json" -Body (@{ email=$EMAIL_EXIST; password="WrongPass123" } | ConvertTo-Json)
} catch {
  $_.Exception.Response.StatusCode.value__
  (New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())).ReadToEnd()
}
```
Expected:
- `401`
- Unified credential error text

### T07 Login Success + Protected Endpoint
```powershell
$login = Invoke-RestMethod -Method POST "$BASE/auth/login" -ContentType "application/json" -Body (@{ email=$EMAIL_EXIST; password=$PASS } | ConvertTo-Json)
$token = $login.token
Invoke-RestMethod -Method GET "$BASE/auth/me" -Headers @{ Authorization = "Bearer $token" }
```
Expected:
- Login returns `token`
- `/auth/me` returns user data

### T08 Token Revocation After Password Reset (manual OTP step)
Step:
- Use T04 to request reset code for `$EMAIL_EXIST`
- Manually read the 6-digit code from email

```powershell
$otp = Read-Host "Input reset OTP"
Invoke-RestMethod -Method POST "$BASE/auth/password/reset" -ContentType "application/json" -Body (@{ email=$EMAIL_EXIST; code=$otp; newPassword=$NEW_PASS } | ConvertTo-Json)
```
Expected:
- Password reset succeeds

Verify old token is revoked:
```powershell
try {
  Invoke-RestMethod -Method GET "$BASE/auth/me" -Headers @{ Authorization = "Bearer $token" }
} catch {
  $_.Exception.Response.StatusCode.value__
}
```
Expected:
- Old token returns `401`

Verify new login works:
```powershell
$login2 = Invoke-RestMethod -Method POST "$BASE/auth/login" -ContentType "application/json" -Body (@{ email=$EMAIL_EXIST; password=$NEW_PASS } | ConvertTo-Json)
$token2 = $login2.token
Invoke-RestMethod -Method GET "$BASE/auth/me" -Headers @{ Authorization = "Bearer $token2" }
```
Expected:
- New password login success
- New token can access `/auth/me`

### T09 Input Validation (memories/events hardening)
```powershell
try {
  Invoke-RestMethod -Method POST "$BASE/memories" -Headers @{ Authorization = "Bearer $token" } -ContentType "application/json" -Body (@{ title="t"; date="2026-02-11"; image="data:image/png;base64,aGVsbG8="; rotation="rotate-999" } | ConvertTo-Json)
} catch {
  $_.Exception.Response.StatusCode.value__
}

try {
  Invoke-RestMethod -Method POST "$BASE/events" -Headers @{ Authorization = "Bearer $token" } -ContentType "application/json" -Body (@{ title="x"; subtitle="y"; date="11-02-2026"; type="anniversary" } | ConvertTo-Json)
} catch {
  $_.Exception.Response.StatusCode.value__
}
```
Expected:
- Both return `400`

## 4. Optional Latency Uniformity Spot Check
```powershell
Measure-Command { Invoke-RestMethod -Method POST "$BASE/auth/password/request-reset-code" -ContentType "application/json" -Body (@{ email=$EMAIL_EXIST } | ConvertTo-Json) } | Select-Object TotalMilliseconds
Measure-Command { Invoke-RestMethod -Method POST "$BASE/auth/password/request-reset-code" -ContentType "application/json" -Body (@{ email=$EMAIL_NOT_EXIST } | ConvertTo-Json) } | Select-Object TotalMilliseconds
```
Expected:
- Same order of magnitude (large divergence should be investigated)
