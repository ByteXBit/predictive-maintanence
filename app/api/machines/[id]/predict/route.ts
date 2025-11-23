import { NextRequest, NextResponse } from 'next/server';

interface PredictionResponse {
  score: number;
  risk: 'low' | 'medium' | 'high' | 'critical';
  explanation: string;
  topFeatures: Array<{
    name: string;
    impact: number;
    description: string;
  }>;
  failureTypes?: {
    TWF: number;
    HDF: number;
    PWF: number;
    OSF: number;
    RNF: number;
  };
  featureResponsibilities?: Array<{
    feature: string;
    value: number;
    responsibleFor: Array<{
      failureType: string;
      probability: number;
      reason: string;
    }>;
  }>;
}

// Generate fake prediction based on machine ID and date range
function generatePrediction(
  machineId: string,
  startDate: string,
  endDate: string
): PredictionResponse {
  // Simulate some variation based on machine ID
  const seed = parseInt(machineId) || 1;
  const baseScore = 50 + (seed % 50); // Score between 50-100 or 0-50 based on seed

  // Generate a semi-random score with some consistency
  const variance = Math.sin(seed * 0.5) * 20;
  const score = Math.max(0, Math.min(100, Math.round(baseScore + variance)));

  // Determine risk level based on score
  let risk: 'low' | 'medium' | 'high' | 'critical';
  if (score >= 75) {
    risk = 'low';
  } else if (score >= 50) {
    risk = 'medium';
  } else if (score >= 25) {
    risk = 'high';
  } else {
    risk = 'critical';
  }

  // Generate explanation
  const explanations = {
    low: `Analysis of ${machineId} indicates excellent operational health during the selected period. All key metrics are within normal ranges with minimal variance. Recommended actions: Continue current maintenance schedule.`,
    medium: `Analysis of ${machineId} shows moderate performance with some areas requiring attention. While the equipment is operational, several factors suggest upcoming maintenance needs. Recommended actions: Schedule preventive maintenance within the next 2-4 weeks.`,
    high: `Analysis of ${machineId} reveals significant deterioration trends. Multiple indicators suggest increased failure risk. Immediate attention recommended. Recommended actions: Schedule maintenance within 1-2 weeks and increase monitoring frequency.`,
    critical: `Analysis of ${machineId} indicates critical condition with high failure probability. Multiple failure modes detected. Urgent intervention required. Recommended actions: Schedule immediate inspection and prepare for emergency maintenance.`,
  };

  // Generate top 3 features with simulated data
  const featureTemplates = [
    {
      name: 'Vibration Analysis',
      descriptions: {
        low: 'Vibration levels remain within optimal ranges',
        medium: 'Slight increase in vibration amplitude detected',
        high: 'Elevated vibration patterns indicate bearing wear',
        critical: 'Severe vibration anomalies detected - bearing failure imminent',
      },
      baseImpact: 25,
    },
    {
      name: 'Temperature Trends',
      descriptions: {
        low: 'Temperature profiles stable and optimal',
        medium: 'Minor temperature fluctuations observed',
        high: 'Gradual temperature rise indicating potential overheating',
        critical: 'Critical temperature spikes detected - thermal stress high',
      },
      baseImpact: 20,
    },
    {
      name: 'Maintenance History',
      descriptions: {
        low: 'Recent maintenance completed on schedule',
        medium: 'Maintenance intervals approaching recommended limits',
        high: 'Extended time since last maintenance - overdue inspection needed',
        critical: 'Critical maintenance tasks overdue - immediate action required',
      },
      baseImpact: 15,
    },
    {
      name: 'Operational Load',
      descriptions: {
        low: 'Equipment operating within design specifications',
        medium: 'Sustained operation at moderate load levels',
        high: 'High operational load contributing to accelerated wear',
        critical: 'Excessive operational load causing severe stress',
      },
      baseImpact: -10,
    },
    {
      name: 'Oil Quality Index',
      descriptions: {
        low: 'Oil quality excellent - no contamination detected',
        medium: 'Oil quality acceptable but approaching replacement threshold',
        high: 'Oil degradation detected - replacement recommended soon',
        critical: 'Critical oil contamination - immediate replacement required',
      },
      baseImpact: 18,
    },
  ];

  // Select 3 features based on risk level and add some variation
  const selectedFeatures = featureTemplates.slice(0, 3).map((template, index) => {
    const impactVariation = (Math.random() - 0.5) * 10;
    const impact =
      risk === 'low'
        ? -Math.abs(template.baseImpact + impactVariation)
        : template.baseImpact + impactVariation;

    return {
      name: template.name,
      impact: Math.round(impact * 10) / 10,
      description: template.descriptions[risk],
    };
  });

  // Sort by absolute impact (descending)
  selectedFeatures.sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));

  return {
    score,
    risk,
    explanation: explanations[risk],
    topFeatures: selectedFeatures,
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Start date and end date are required' },
        { status: 400 }
      );
    }

    // Fetch dynamic telemetry data based on machine ID and date range
    const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5000';
    
    // Get dynamic telemetry from telemetry service
    let telemetry;
    try {
      const telemetryResponse = await fetch(
        `${request.nextUrl.origin}/api/telemetry/${params.id}?startDate=${startDate}&endDate=${endDate}`,
        {
          method: 'GET',
        }
      );
      
      if (telemetryResponse.ok) {
        const telemetryData = await telemetryResponse.json();
        telemetry = telemetryData.telemetry;
      } else {
        throw new Error('Failed to fetch telemetry');
      }
    } catch (error) {
      console.warn('Telemetry service unavailable, generating fallback telemetry:', error);
      // Fallback: generate basic telemetry
      const seed = parseInt(params.id) || 1;
      telemetry = {
        air_temperature: 300 + (seed % 20),
        process_temperature: 310 + (seed % 15),
        rotational_speed: 1500 + (seed % 500),
        torque: 40 + (seed % 20),
        tool_wear: (seed % 3) * 50,
        type: seed % 3,
      };
    }

    // Try to use ML service with dynamic telemetry data
    try {
      const mlResponse = await fetch(`${ML_SERVICE_URL}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          machineId: params.id,
          telemetry,
        }),
        signal: AbortSignal.timeout(5000),
      });

      if (mlResponse.ok) {
        const mlPrediction = await mlResponse.json();
        
        // Convert ML prediction format to expected format
        return NextResponse.json({
          score: mlPrediction.score,
          risk: mlPrediction.risk,
          explanation: mlPrediction.explanation,
          topFeatures: mlPrediction.shapFeatures.slice(0, 3).map((feat: any) => {
            // Create descriptive text based on feature and value
            let description = `${feat.feature}: ${feat.value.toFixed(2)}`;
            if (feat.impact < 0) {
              description += ` - Contributing to failure risk (${Math.abs(feat.impact).toFixed(1)}% impact)`;
            } else {
              description += ` - Normal/healthy indicator (${feat.impact.toFixed(1)}% impact)`;
            }
            return {
              name: feat.feature,
              impact: feat.impact,
              description: description,
            };
          }),
          failureTypes: mlPrediction.failureTypes,
          featureResponsibilities: mlPrediction.featureResponsibilities,
        });
      }
    } catch (error) {
      console.warn('ML service unavailable, using mock prediction:', error);
      // Fall through to mock prediction
    }

    // Fallback to mock prediction if ML service is unavailable
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 500));
    const prediction = generatePrediction(params.id, startDate, endDate);
    // Add mock failure types for consistency
    const mockFailureTypes = {
      TWF: Math.min(0.3, (parseInt(params.id) % 3) * 0.1),
      HDF: Math.min(0.2, (parseInt(params.id) % 2) * 0.1),
      PWF: Math.min(0.15, (parseInt(params.id) % 4) * 0.05),
      OSF: Math.min(0.25, (parseInt(params.id) % 3) * 0.1),
      RNF: Math.min(0.1, (parseInt(params.id) % 5) * 0.02),
    };
    return NextResponse.json({
      ...prediction,
      failureTypes: mockFailureTypes,
      featureResponsibilities: [],
    });
  } catch (error) {
    console.error('Prediction error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

