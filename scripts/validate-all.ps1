# Comprehensive Validation Script
# Tests all endpoints and verifies integration

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Predictive Maintenance - Full Validation" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$errors = @()
$warnings = @()
$success = 0

function Test-Service {
    param(
        [string]$Name,
        [string]$Url,
        [int]$Timeout = 5
    )
    
    Write-Host -NoNewline "  Testing $Name... " -ForegroundColor Yellow
    try {
        $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec $Timeout -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "✓ PASS" -ForegroundColor Green
            $script:success++
            return $true
        } else {
            Write-Host "✗ FAIL (HTTP $($response.StatusCode))" -ForegroundColor Red
            $script:errors += "$Name returned HTTP $($response.StatusCode)"
            return $false
        }
    } catch {
        Write-Host "✗ FAIL" -ForegroundColor Red
        $script:errors += "$Name is not responding: $($_.Exception.Message)"
        return $false
    }
}

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Url,
        [string]$Body = $null,
        [int]$Timeout = 10
    )
    
    Write-Host -NoNewline "  Testing $Name... " -ForegroundColor Yellow
    try {
        if ($Method -eq "GET") {
            $response = Invoke-RestMethod -Uri $Url -Method $Method -TimeoutSec $Timeout -ErrorAction Stop
        } else {
            $response = Invoke-RestMethod -Uri $Url -Method $Method -Body $Body -ContentType "application/json" -TimeoutSec $Timeout -ErrorAction Stop
        }
        Write-Host "✓ PASS" -ForegroundColor Green
        $script:success++
        return $response
    } catch {
        Write-Host "✗ FAIL" -ForegroundColor Red
        $script:errors += "$Name failed: $($_.Exception.Message)"
        return $null
    }
}

# 1. Service Health Checks
Write-Host "1. Service Health Checks" -ForegroundColor Cyan
Write-Host "-----------------------" -ForegroundColor Cyan
Test-Service "Next.js Frontend" "http://localhost:3000"
Test-Service "Express API" "http://localhost:3001/health"
Test-Service "Python ML Service" "http://localhost:5000/health"
Write-Host ""

# 2. Telemetry Endpoint (Dynamic Data)
Write-Host "2. Telemetry Endpoint (Dynamic Data)" -ForegroundColor Cyan
Write-Host "-------------------------------------" -ForegroundColor Cyan
$today = Get-Date -Format "yyyy-MM-dd"
$startDate1 = (Get-Date).AddDays(-30).ToString("yyyy-MM-dd")
$startDate2 = (Get-Date).AddDays(-15).ToString("yyyy-MM-dd")

$telemetry1 = Test-Endpoint "Telemetry (Machine 1, Range 1)" "GET" "http://localhost:3000/api/telemetry/1?startDate=$startDate1&endDate=$today"
$telemetry2 = Test-Endpoint "Telemetry (Machine 1, Range 2)" "GET" "http://localhost:3000/api/telemetry/1?startDate=$startDate2&endDate=$today"
$telemetry3 = Test-Endpoint "Telemetry (Machine 2)" "GET" "http://localhost:3000/api/telemetry/2?startDate=$startDate1&endDate=$today"

if ($telemetry1 -and $telemetry2) {
    $isDynamic = $telemetry1.telemetry.air_temperature -ne $telemetry2.telemetry.air_temperature
    if ($isDynamic) {
        Write-Host "  ✓ Telemetry is dynamic (values change with date range)" -ForegroundColor Green
        $success++
    } else {
        Write-Host "  ⚠ Telemetry values are identical for different date ranges" -ForegroundColor Yellow
        $warnings += "Telemetry may not be fully dynamic"
    }
}

if ($telemetry1 -and $telemetry3) {
    $isDifferent = $telemetry1.telemetry.air_temperature -ne $telemetry3.telemetry.air_temperature
    if ($isDifferent) {
        Write-Host "  ✓ Telemetry varies by machine ID" -ForegroundColor Green
        $success++
    }
}
Write-Host ""

# 3. ML Service Integration
Write-Host "3. ML Service Integration" -ForegroundColor Cyan
Write-Host "--------------------------" -ForegroundColor Cyan
if ($telemetry1) {
    $mlBody = @{
        machineId = "1"
        telemetry = $telemetry1.telemetry
    } | ConvertTo-Json -Depth 10
    
    $mlResponse = Test-Endpoint "ML Prediction" "POST" "http://localhost:5000/predict" $mlBody
    
    if ($mlResponse) {
        if ($mlResponse.score -ge 0 -and $mlResponse.score -le 100) {
            Write-Host "  ✓ ML prediction score is valid (0-100)" -ForegroundColor Green
            $success++
        }
        if ($mlResponse.shapFeatures -and $mlResponse.shapFeatures.Count -gt 0) {
            Write-Host "  ✓ ML returns SHAP features" -ForegroundColor Green
            $success++
            # Check if features are from actual model
            $realFeatures = @("Rotational speed rpm", "Mechanical Power W", "Torque Nm", "Tool wear min", "temperature_difference")
            $hasRealFeatures = $mlResponse.shapFeatures | Where-Object { $realFeatures -contains $_.feature }
            if ($hasRealFeatures) {
                Write-Host "  ✓ ML returns real model features (not mock)" -ForegroundColor Green
                $success++
            } else {
                Write-Host "  ⚠ ML features may be mocked" -ForegroundColor Yellow
                $warnings += "ML features may not be from real model"
            }
        }
    }
}
Write-Host ""

# 4. Full Prediction Flow
Write-Host "4. Full Prediction Flow (Next.js -> Telemetry -> ML)" -ForegroundColor Cyan
Write-Host "------------------------------------------------------" -ForegroundColor Cyan
$prediction = Test-Endpoint "Full Prediction Flow" "GET" "http://localhost:3000/api/machines/1/predict?startDate=$startDate1&endDate=$today"

if ($prediction) {
    if ($prediction.score -ge 0 -and $prediction.score -le 100) {
        Write-Host "  ✓ Prediction score is valid" -ForegroundColor Green
        $success++
    }
    if ($prediction.topFeatures -and $prediction.topFeatures.Count -gt 0) {
        Write-Host "  ✓ Prediction includes top features" -ForegroundColor Green
        $success++
    }
    if ($prediction.risk -in @("low", "medium", "high", "critical")) {
        Write-Host "  ✓ Prediction risk level is valid" -ForegroundColor Green
        $success++
    }
}
Write-Host ""

# 5. Express API Endpoints
Write-Host "5. Express API Endpoints" -ForegroundColor Cyan
Write-Host "------------------------" -ForegroundColor Cyan
$loginBody = @{
    email = "manager@example.com"
    password = "Password123!"
} | ConvertTo-Json

$loginResponse = Test-Endpoint "Login" "POST" "http://localhost:3001/api/auth/login" $loginBody
if ($loginResponse -and $loginResponse.user) {
    Write-Host "  ✓ Login returns user object" -ForegroundColor Green
    $success++
    if ($loginResponse.user.role) {
        Write-Host "  ✓ User has role attribute" -ForegroundColor Green
        $success++
    }
}
Write-Host ""

# 6. Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Validation Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Passed: $success" -ForegroundColor Green
Write-Host "  Errors: $($errors.Count)" -ForegroundColor $(if ($errors.Count -eq 0) { "Green" } else { "Red" })
Write-Host "  Warnings: $($warnings.Count)" -ForegroundColor $(if ($warnings.Count -eq 0) { "Green" } else { "Yellow" })
Write-Host ""

if ($errors.Count -gt 0) {
    Write-Host "Errors:" -ForegroundColor Red
    foreach ($error in $errors) {
        Write-Host "  - $error" -ForegroundColor Red
    }
    Write-Host ""
}

if ($warnings.Count -gt 0) {
    Write-Host "Warnings:" -ForegroundColor Yellow
    foreach ($warning in $warnings) {
        Write-Host "  - $warning" -ForegroundColor Yellow
    }
    Write-Host ""
}

if ($errors.Count -eq 0 -and $warnings.Count -eq 0) {
    Write-Host "✓ All validations passed!" -ForegroundColor Green
} elseif ($errors.Count -eq 0) {
    Write-Host "✓ Core functionality working (some warnings)" -ForegroundColor Green
} else {
    Write-Host "✗ Some validations failed" -ForegroundColor Red
}

