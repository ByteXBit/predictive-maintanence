# Quick Start Guide - ML Integration

## Step 1: Install Python Dependencies

```bash
cd ml_service
pip install -r requirements.txt
```

## Step 2: Train the Model

This will train the XGBoost model using your dataset:

```bash
python train_model.py
```

Expected output:
```
Loading dataset...
Preprocessing...
Training XGBoost model...

Model Performance:
Accuracy: 0.XXX
AUC: 0.XXX

Saving model...
Model saved to: models/xgb_model.pkl
Feature names: 9 features
Training complete!
```

## Step 3: Start the ML Service

```bash
python predict_service.py
```

You should see:
```
Starting ML Prediction Service...
Make sure to run train_model.py first to generate the model!
Loading model...
Model loaded. Features: 9
 * Running on http://0.0.0.0:5000
```

## Step 4: Test the Service

In another terminal, test the service:

```bash
curl -X POST http://localhost:5000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "machineId": "1",
    "telemetry": {
      "air_temperature": 300,
      "process_temperature": 310,
      "rotational_speed": 1500,
      "torque": 40,
      "tool_wear": 0,
      "type": 0
    }
  }'
```

## Step 5: Use in Next.js App

The Next.js app will automatically use the ML service if it's running on port 5000. 

1. Start the Next.js frontend: `npm run dev`
2. Start the Express API: `npm run dev:api`
3. Start the ML service: `python predict_service.py` (in ml_service directory)

When you run predictions in the app, they will use the real ML model!

## Troubleshooting

- **Model not found**: Make sure you ran `train_model.py` first
- **Port 5000 in use**: Change the port in `predict_service.py` and update `ML_SERVICE_URL` in `.env`
- **Import errors**: Make sure all dependencies are installed: `pip install -r requirements.txt`
- **CSV not found**: Check that `ai4i2020 (1).csv` is in the project root directory

