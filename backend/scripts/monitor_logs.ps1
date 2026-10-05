# ==============================================================================
# BUKIT KASIH - Automated Security Log Monitor & Anomaly Detector
# (OWASP Internal Audit - Items G5, G6)
# ==============================================================================
param (
    [string]$LogPath = "",
    [int]$BruteForceThreshold = 5
)

if (-not $LogPath) {
    if (Test-Path "$PSScriptRoot\..\logs\security_audit.log") {
        $LogPath = "$PSScriptRoot\..\logs\security_audit.log"
    } elseif (Test-Path "$PSScriptRoot\..\tests\logs\security_audit.log") {
        $LogPath = "$PSScriptRoot\..\tests\logs\security_audit.log"
    } else {
        $LogPath = "$PSScriptRoot\..\logs\security_audit.log"
    }
}

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "       BUKIT KASIH - SECURITY AUDIT LOG MONITOR           " -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Log Target: $LogPath" -ForegroundColor DarkGray
Write-Host "Waktu Audit: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor DarkGray
Write-Host ""

if (-not (Test-Path $LogPath)) {
    Write-Host "[INFO] Berkas log audit belum ditemukan di $LogPath." -ForegroundColor Yellow
    Write-Host "Sistem belum merekam log keamanan atau log baru saja dirotasi." -ForegroundColor Yellow
    exit 0
}

$lines = Get-Content $LogPath
$totalLines = $lines.Count

$authSuccess = 0
$authFails = 0
$adminActions = 0
$securityWarnings = 0
$failedIPs = @{}

foreach ($line in $lines) {
    if ($line -match "\[AUDIT_AUTH_SUCCESS\]") {
        $authSuccess++
    }
    elseif ($line -match "\[SECURITY_WARNING_AUTH_FAIL\]") {
        $authFails++
        if ($line -match "IP:\s*([^\s\|]+)") {
            $ip = $matches[1]
            if ($failedIPs.ContainsKey($ip)) {
                $failedIPs[$ip]++
            } else {
                $failedIPs[$ip] = 1
            }
        }
    }
    elseif ($line -match "\[AUDIT_ADMIN_ACTION\]") {
        $adminActions++
    }
    elseif ($line -match "\[SECURITY_WARNING\]") {
        $securityWarnings++
    }
}

Write-Host "--- RINGKASAN AKTIVITAS SISTEM ---" -ForegroundColor White
Write-Host "Total Entri Audit: $totalLines"
Write-Host "Login Sukses: $authSuccess" -ForegroundColor Green
Write-Host "Percobaan Login Gagal: $authFails" -ForegroundColor $(if ($authFails -gt 0) { "Yellow" } else { "Green" })
Write-Host "Aksi Administratif: $adminActions" -ForegroundColor Cyan
Write-Host "Peringatan Keamanan: $securityWarnings" -ForegroundColor $(if ($securityWarnings -gt 0) { "Red" } else { "Green" })
Write-Host ""

# Anomaly Detection: Brute Force Checks
$threatDetected = $false
Write-Host "--- ANALISIS ANOMALI & BRUTE-FORCE ---" -ForegroundColor White

if ($failedIPs.Count -eq 0) {
    Write-Host "[OK] Tidak ditemukan anomali percobaan login gagal." -ForegroundColor Green
} else {
    foreach ($entry in $failedIPs.GetEnumerator()) {
        $ip = $entry.Key
        $count = $entry.Value

        if ($count -ge $BruteForceThreshold) {
            $threatDetected = $true
            Write-Host "[CRITICAL ALERT] IP $ip melakukan $count percobaan login gagal (Melebihi ambang batas $BruteForceThreshold)!" -ForegroundColor Red
        } else {
            Write-Host "[MONITOR] IP $ip memiliki $count percobaan login gagal." -ForegroundColor Yellow
        }
    }
}

Write-Host ""
if ($threatDetected) {
    Write-Host "[REKOMENDASI AI/KEAMANAN] Terdeteksi potensi serangan brute-force. Segera periksa daftar IP di atas dan pertimbangkan pemblokiran firewall jika mencurigakan." -ForegroundColor Red
} else {
    Write-Host "[KESIMPULAN] Kondisi sistem aman. Tidak ada aktivitas mencurigakan yang melampaui batas keamanan." -ForegroundColor Green
}
Write-Host "============================================================" -ForegroundColor Cyan
