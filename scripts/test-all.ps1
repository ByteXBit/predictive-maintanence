# Comprehensive test script for all endpoints (PowerShell)

Write-Host "=== Testing Predictive Maintenance API ===" -ForegroundColor Cyan
Write-Host ""

$passed = 0
$failed = 0

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Url,
        [string]$Body = $null
    )
    
    Write-Host -NoNewline "Testing $Name... "
    
    try {
        if ($Method -eq "GET") {
            $response = Invoke-WebRequest -Uri $Url -Method $Method -UseBasicParsing -ErrorAction Stop
        } else {
            $response = Invoke-WebRequest -Uri $Url -Method $Method -Body $Body -ContentType "application/json" -UseBasicParsing -ErrorAction Stop
        }
        
        if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 300) {
            Write-Host "✓ PASS" -ForegroundColor Green "(HTTP $($response.StatusCode))"
            $script:passed++
            return $true
        } else {
            Write-Host "✗ FAIL" -ForegroundColor Red "(HTTP $($response.StatusCode))"
            $script:failed++
            return $false
        }
    } catch {
        Write-Host "✗ FAIL" -ForegroundColor Red "($($_.Exception.Message))"
        $script:failed++
        return $false
    }
}

# Test Next.js API endpoints
Write-Host "=== Next.js API Endpoints ===" -ForegroundColor Yellow
$today = Get-Date -Format "yyyy-MM-dd"
$startDate = (Get-Date).AddDays(-30).ToString("yyyy-MM-dd")

Test-Endpoint "Telemetry for Machine 1" "GET" "http://localhost:3000/api/telemetry/1?startDate=$startDate&endDate=$today"
Test-Endpoint "Prediction for Machine 1" "GET" "http://localhost:3000/api/machines/1/predict?startDate=$startDate&endDate=$today"

# Test Express API endpoints
Write-Host ""
Write-Host "=== Express API Endpoints ===" -ForegroundColor Yellow
Test-Endpoint "Express Health" "GET" "http://localhost:3001/health"
$loginBody = '{"email":"manager@example.com","password":"Password123!"}' | ConvertTo-Json -Compress
Test-Endpoint "Login" "POST" "http://localhost:3001/api/auth/login" $loginBody

# Test Python ML Service
Write-Host ""
Write-Host "=== Python ML Service ===" -ForegroundColor Yellow
Test-Endpoint "ML Health" "GET" "http://localhost:5000/health"
$mlBody = '{"machineId":"1","telemetry":{"air_temperature":300,"process_temperature":310,"rotational_speed":1500,"torque":40,"tool_wear":0,"type":0}}' | ConvertTo-Json -Compress
Test-Endpoint "ML Predict" "POST" "http://localhost:5000/predict" $mlBody

Write-Host ""
Write-Host "=== Test Complete ===" -ForegroundColor Cyan
Write-Host "Passed: $passed" -ForegroundColor Green
Write-Host "Failed: $failed" -ForegroundColor $(if ($failed -eq 0) { "Green" } else { "Red" })

