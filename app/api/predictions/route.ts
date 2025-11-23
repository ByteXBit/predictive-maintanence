import { NextRequest, NextResponse } from 'next/server';

export interface Prediction {
  id: string;
  machineId: string;
  machineName: string;
  score: number;
  risk: 'low' | 'medium' | 'high' | 'critical';
  explanation: string;
  topFeatures: Array<{
    name: string;
    impact: number;
    description: string;
  }>;
  predictionDate: string;
  createdAt: string;
  userId?: string;
  userEmail?: string;
  modelVersion?: string;
}

// In-memory storage for predictions (replace with database in production)
export const predictions: Prediction[] = [];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const machineId = searchParams.get('machineId');
    const risk = searchParams.get('risk');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let filteredPredictions = [...predictions];

    // Filter by machine
    if (machineId) {
      filteredPredictions = filteredPredictions.filter(
        (p) => p.machineId === machineId
      );
    }

    // Filter by risk
    if (risk && ['low', 'medium', 'high', 'critical'].includes(risk)) {
      filteredPredictions = filteredPredictions.filter((p) => p.risk === risk);
    }

    // Filter by date range
    if (startDate) {
      filteredPredictions = filteredPredictions.filter(
        (p) => new Date(p.predictionDate) >= new Date(startDate)
      );
    }
    if (endDate) {
      filteredPredictions = filteredPredictions.filter(
        (p) => new Date(p.predictionDate) <= new Date(endDate)
      );
    }

    // Sort by creation date (newest first)
    filteredPredictions.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({
      predictions: filteredPredictions,
      total: filteredPredictions.length,
    });
  } catch (error) {
    console.error('Get predictions error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      machineId,
      machineName,
      score,
      risk,
      explanation,
      topFeatures,
      predictionDate,
      userId,
      userEmail,
      modelVersion = '1.0.0',
    } = body;

    // Validate required fields
    if (
      !machineId ||
      !machineName ||
      score === undefined ||
      !risk ||
      !explanation ||
      !topFeatures ||
      !predictionDate
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create new prediction record
    const newPrediction: Prediction = {
      id: `pred-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      machineId,
      machineName,
      score,
      risk: risk as Prediction['risk'],
      explanation,
      topFeatures,
      predictionDate,
      createdAt: new Date().toISOString(),
      userId,
      userEmail,
      modelVersion,
    };

    predictions.push(newPrediction);

    return NextResponse.json(
      {
        message: 'Prediction recorded successfully',
        prediction: newPrediction,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create prediction error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

