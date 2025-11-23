import { NextRequest, NextResponse } from 'next/server';
import { predictions } from '../predictions/route';
import { alerts } from '../alerts/route';

// Seed demo data
export async function POST(request: NextRequest) {
  try {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const threeWeeksAgo = new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000);

    // Seed predictions
    const seedPredictions = [
      {
        id: `pred-${Date.now()}-1`,
        machineId: '1',
        machineName: 'Machine A - Production Line 1',
        score: 92,
        risk: 'low' as const,
        explanation: 'Machine A shows excellent operational health.',
        topFeatures: [
          { name: 'Vibration Analysis', impact: -5, description: 'Normal vibration levels' },
          { name: 'Temperature Trends', impact: 8, description: 'Optimal temperature range' },
          { name: 'Maintenance History', impact: 10, description: 'Recent maintenance completed' },
        ],
        predictionDate: oneWeekAgo.toISOString().split('T')[0],
        createdAt: oneWeekAgo.toISOString(),
        userId: '3',
        userEmail: 'manager@example.com',
        modelVersion: '1.0.0',
      },
      {
        id: `pred-${Date.now()}-2`,
        machineId: '2',
        machineName: 'Machine B - Production Line 2',
        score: 35,
        risk: 'high' as const,
        explanation: 'Machine B reveals significant deterioration trends.',
        topFeatures: [
          { name: 'Vibration Analysis', impact: -25, description: 'Elevated vibration patterns' },
          { name: 'Temperature Trends', impact: -18, description: 'Gradual temperature increase' },
          { name: 'Maintenance History', impact: -15, description: 'Extended time since maintenance' },
        ],
        predictionDate: twoWeeksAgo.toISOString().split('T')[0],
        createdAt: twoWeeksAgo.toISOString(),
        userId: '2',
        userEmail: 'maintenance@example.com',
        modelVersion: '1.0.0',
      },
      {
        id: `pred-${Date.now()}-3`,
        machineId: '3',
        machineName: 'Machine C - Production Line 1',
        score: 85,
        risk: 'low' as const,
        explanation: 'Machine C indicates excellent operational health.',
        topFeatures: [
          { name: 'Vibration Analysis', impact: -3, description: 'Normal vibration levels' },
          { name: 'Operational Load', impact: 7, description: 'Operating within specifications' },
          { name: 'Oil Quality Index', impact: 9, description: 'Oil quality excellent' },
        ],
        predictionDate: threeWeeksAgo.toISOString().split('T')[0],
        createdAt: threeWeeksAgo.toISOString(),
        userId: '1',
        userEmail: 'operator@example.com',
        modelVersion: '1.0.0',
      },
    ];

    // Seed alerts
    const seedAlerts = [
      {
        id: `alert-${Date.now()}-1`,
        machineId: '2',
        machineName: 'Machine B - Production Line 2',
        title: 'High Risk Alert: Machine B - Production Line 2',
        description: 'Analysis reveals significant deterioration trends. Multiple indicators suggest increased failure risk. (Score: 35)',
        risk: 'high' as const,
        score: 35,
        status: 'active' as const,
        createdAt: twoWeeksAgo.toISOString(),
        predictionDate: twoWeeksAgo.toISOString().split('T')[0],
      },
      {
        id: `alert-${Date.now()}-2`,
        machineId: '4',
        machineName: 'Machine D - Quality Control',
        title: 'High Risk Alert: Machine D - Quality Control',
        description: 'Analysis reveals significant deterioration trends. Immediate attention recommended. (Score: 42)',
        risk: 'high' as const,
        score: 42,
        status: 'acknowledged' as const,
        createdAt: oneWeekAgo.toISOString(),
        acknowledgedAt: new Date(oneWeekAgo.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        acknowledgedBy: {
          id: '2',
          email: 'maintenance@example.com',
          role: 'MAINTENANCE',
        },
        predictionDate: oneWeekAgo.toISOString().split('T')[0],
      },
    ];

    // Clear existing data
    predictions.length = 0;
    alerts.length = 0;

    // Add seed data
    predictions.push(...seedPredictions);
    alerts.push(...seedAlerts);

    return NextResponse.json({
      message: 'Demo data seeded successfully',
      predictions: predictions.length,
      alerts: alerts.length,
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

