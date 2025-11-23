# Quick Test Guide

## ✅ Verify Everything is Working

### 1. Check All Services
```powershell
# Test Next.js API
curl http://localhost:3000/api/telemetry/1?startDate=2024-01-01&endDate=2024-01-31

# Test Express API
curl http://localhost:3001/health

# Test Python ML Service
curl http://localhost:5000/health
```

### 2. Test Dynamic Telemetry
```powershell
# Get telemetry for different date ranges
$t1 = (Invoke-RestMethod "http://localhost:3000/api/telemetry/1?startDate=2024-01-01&endDate=2024-01-15").telemetry
$t2 = (Invoke-RestMethod "http://localhost:3000/api/telemetry/1?startDate=2024-01-16&endDate=2024-01-31").telemetry

# Values should be different
Write-Host "Different values: $($t1.air_temperature -ne $t2.air_temperature)"
```

### 3. Test ML Prediction
```powershell
# Get telemetry
$telemetry = (Invoke-RestMethod "http://localhost:3000/api/telemetry/1?startDate=2024-01-01&endDate=2024-01-31").telemetry

# Test ML service directly
$body = @{machineId="1";telemetry=$telemetry} | ConvertTo-Json
$prediction = Invoke-RestMethod -Uri "http://localhost:5000/predict" -Method POST -Body $body -ContentType "application/json"

# Check for real ML features
$prediction.shapFeatures | Select-Object feature, impact
```

### 4. Test Full Flow
```powershell
# Full prediction flow (Next.js -> Telemetry -> ML)
$prediction = Invoke-RestMethod "http://localhost:3000/api/machines/1/predict?startDate=2024-01-01&endDate=2024-01-31"

# Should return:
# - score (0-100)
# - risk (low/medium/high/critical)
# - topFeatures (with real ML feature names)
$prediction | Format-List
```

### 5. Visual Verification

1. **Open Browser**: `http://localhost:3000/login`
2. **Login**: `manager@example.com` / `Password123!`
3. **Navigate**: Go to `/machines`
4. **Click Predict**: On any machine
5. **Select Date Range**: Pick any range
6. **Run Prediction**: Click "Run Prediction"
7. **Verify**:
   - Health score appears (gauge)
   - Top 3 features shown
   - Feature names should be from ML model (e.g., "Rotational speed rpm", "Mechanical Power W")
   - NOT generic names like "Vibration Analysis"

## ✅ Success Indicators

- ✅ All 3 services respond to health checks
- ✅ Telemetry values change with different date ranges
- ✅ ML service returns predictions with real feature names
- ✅ Full prediction flow works end-to-end
- ✅ Frontend displays predictions correctly

## ❌ If Something Fails

1. **ML Service Not Working**:
   - Check if model exists: `ml_service/models/xgb_model.pkl`
   - Check Python service: `python ml_service/predict_service.py`
   - Check dependencies: `pip install -r ml_service/requirements.txt`

2. **Telemetry Not Dynamic**:
   - Check `/app/api/telemetry/[id]/route.ts`
   - Verify date range is passed correctly

3. **Predictions Not Using ML**:
   - Check ML service health
   - Check Next.js console for errors
   - Verify ML_SERVICE_URL environment variable

