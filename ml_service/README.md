# ML Service for Predictive Maintenance

This directory contains the Python ML service that provides real predictions using a trained XGBoost model.

## Setup

1. **Install Python dependencies:**
```bash
cd ml_service
pip install -r requirements.txt
```

2. **Train the model:**
```bash
python train_model.py
```

This will:
- Load the dataset from `../ai4i2020 (1).csv`
- Train an XGBoost model
- Save the model to `models/xgb_model.pkl`
- Save preprocessing objects (label encoder, etc.)

3. **Start the prediction service:**
```bash
python predict_service.py
```

The service will run on `http://localhost:5000`

## API Endpoints

### Health Check
```
GET /health
```

### Predict
```
POST /predict
Content-Type: application/json

{
  "machineId": "1",
  "telemetry": {
    "air_temperature": 300,
    "process_temperature": 310,
    "rotational_speed": 1500,
    "torque": 40,
    "tool_wear": 0,
    "type": 0
  }
}
```

Response:
```json
{
  "score": 85.5,
  "risk": "low",
  "probability": {...},
  "explanation": "...",
  "shapFeatures": [...],
  "modelVersion": "1.0.0",
  "timestamp": "...",
  "failureProbability": 0.145,
  "failurePredicted": false
}
```

## Integration with Next.js

The Next.js app will automatically call this service if it's running. If the service is unavailable, it falls back to mock predictions.

Set the environment variable to change the service URL:
```env
ML_SERVICE_URL=http://localhost:5000
```

## Model Details

- **Algorithm:** XGBoost Classifier
- **Features:** 9 features including:
  - Air temperature [K]
  - Process temperature [K]
  - Rotational speed [rpm]
  - Torque [Nm]
  - Tool wear [min]
  - Type (encoded)
  - temperature_difference (derived)
  - Mechanical Power [W] (derived)

- **Output:** Health score (0-100) and failure probability

