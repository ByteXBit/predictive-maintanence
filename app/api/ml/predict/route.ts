import { NextRequest, NextResponse } from 'next/server';

interface MLPredictionRequest {
  machineId: string;
  telemetry: {
    [key: string]: number;
  };
}

interface SHAPFeature {
  feature: string;
  value: number;
  shapValue: number;
  impact: number; // -100 to 100
}

interface MLPredictionResponse {
  score: number; // 0-100 health score
  risk: 'low' | 'medium' | 'high' | 'critical';
  probability: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  explanation: string;
  shapFeatures: SHAPFeature[]; // Top features with SHAP-like values
  modelVersion: string;
  timestamp: string;
}

// Mock ML model - in production, this would load a sklearn pickle file
function mockMLPredict(
  machineId: string,
  telemetry: { [key: string]: number }
): MLPredictionResponse {
  // Simulate feature mapping from telemetry to model inputs
  const features = {
    air_temperature: telemetry.air_temperature || 300,
    process_temperature: telemetry.process_temperature || 310,
    rotational_speed: telemetry.rotational_speed || 1500,
    torque: telemetry.torque || 40,
    tool_wear: telemetry.tool_wear || 0,
    vibration: telemetry.vibration || 40,
    pressure: telemetry.pressure || 100,
    humidity: telemetry.humidity || 50,
  };

  // Mock prediction logic based on telemetry values
  // Normalize values to 0-100 scale for health score
  let healthScore = 100;

  // Penalize high temperatures
  if (features.process_temperature > 310) {
    healthScore -= (features.process_temperature - 310) * 2;
  }

  // Penalize high tool wear
  if (features.tool_wear > 0) {
    healthScore -= features.tool_wear * 0.5;
  }

  // Penalize high vibration
  if (features.vibration > 40) {
    healthScore -= (features.vibration - 40) * 1.5;
  }

  // Penalize low torque (potential issue)
  if (features.torque < 30) {
    healthScore -= (30 - features.torque) * 1;
  }

  // Ensure score is within bounds
  healthScore = Math.max(0, Math.min(100, healthScore));

  // Determine risk level
  let risk: 'low' | 'medium' | 'high' | 'critical';
  if (healthScore >= 75) {
    risk = 'low';
  } else if (healthScore >= 50) {
    risk = 'medium';
  } else if (healthScore >= 25) {
    risk = 'high';
  } else {
    risk = 'critical';
  }

  // Generate probability distribution
  const probabilities = {
    low: risk === 'low' ? 0.7 : risk === 'medium' ? 0.2 : risk === 'high' ? 0.1 : 0.0,
    medium:
      risk === 'medium'
        ? 0.6
        : risk === 'low'
        ? 0.2
        : risk === 'high'
        ? 0.15
        : 0.05,
    high:
      risk === 'high'
        ? 0.6
        : risk === 'medium'
        ? 0.2
        : risk === 'critical'
        ? 0.15
        : 0.05,
    critical:
      risk === 'critical'
        ? 0.7
        : risk === 'high'
        ? 0.2
        : risk === 'medium'
        ? 0.1
        : 0.0,
  };

  // Generate SHAP-like feature explanations
  const shapFeatures: SHAPFeature[] = [
    {
      feature: 'Process Temperature',
      value: features.process_temperature,
      shapValue: features.process_temperature > 310 ? -15 : -2,
      impact: features.process_temperature > 310 ? -25 : -5,
    },
    {
      feature: 'Tool Wear',
      value: features.tool_wear,
      shapValue: -features.tool_wear * 0.1,
      impact: -features.tool_wear * 0.3,
    },
    {
      feature: 'Vibration',
      value: features.vibration,
      shapValue: features.vibration > 40 ? -12 : -3,
      impact: features.vibration > 40 ? -20 : -5,
    },
    {
      feature: 'Torque',
      value: features.torque,
      shapValue: features.torque < 30 ? -8 : 5,
      impact: features.torque < 30 ? -15 : 8,
    },
    {
      feature: 'Rotational Speed',
      value: features.rotational_speed,
      shapValue: 3,
      impact: 5,
    },
    {
      feature: 'Air Temperature',
      value: features.air_temperature,
      shapValue: -2,
      impact: -3,
    },
  ]
    .sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact))
    .slice(0, 6); // Top 6 features

  // Generate explanation
  const explanations = {
    low: `Machine ${machineId} shows excellent health indicators. All telemetry parameters are within normal operating ranges.`,
    medium: `Machine ${machineId} shows moderate performance. Some telemetry parameters indicate potential maintenance needs in the near future.`,
    high: `Machine ${machineId} shows concerning trends. Multiple telemetry parameters suggest increased failure risk. Immediate attention recommended.`,
    critical: `Machine ${machineId} is in critical condition. Multiple telemetry parameters indicate high failure probability. Urgent maintenance required.`,
  };

  return {
    score: Math.round(healthScore * 10) / 10,
    risk,
    probability: probabilities,
    explanation: explanations[risk],
    shapFeatures,
    modelVersion: '1.0.0',
    timestamp: new Date().toISOString(),
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as MLPredictionRequest;
    const { machineId, telemetry } = body;

    // Validate required fields
    if (!machineId || !telemetry) {
      return NextResponse.json(
        { error: 'Missing required fields: machineId and telemetry' },
        { status: 400 }
      );
    }

    // Try to call Python ML service, fallback to mock if unavailable
    const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5000';
    
    try {
      const mlResponse = await fetch(`${ML_SERVICE_URL}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          machineId,
          telemetry,
        }),
        // Timeout after 5 seconds
        signal: AbortSignal.timeout(5000),
      });

      if (mlResponse.ok) {
        const prediction = await mlResponse.json();
        // Ensure failure types and feature responsibilities are included
        return NextResponse.json({
          ...prediction,
          failureTypes: prediction.failureTypes || {},
          featureResponsibilities: prediction.featureResponsibilities || [],
        });
      }
    } catch (error) {
      console.warn('ML service unavailable, using mock prediction:', error);
      // Fall through to mock prediction
    }

    // Fallback to mock prediction if ML service is unavailable
    const prediction = mockMLPredict(machineId, telemetry);
    return NextResponse.json(prediction);
  } catch (error) {
    console.error('ML prediction error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

