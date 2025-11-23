import { NextRequest, NextResponse } from 'next/server';

export type AlertStatus = 'active' | 'acknowledged' | 'resolved';
export type AlertRisk = 'low' | 'medium' | 'high' | 'critical';

export interface Alert {
  id: string;
  machineId: string;
  machineName: string;
  title: string;
  description: string;
  risk: AlertRisk;
  score: number;
  status: AlertStatus;
  createdAt: string;
  acknowledgedAt?: string;
  acknowledgedBy?: {
    id: string;
    email: string;
    role: string;
  };
  predictionDate: string;
}

// In-memory storage (replace with database in production)
export const alerts: Alert[] = [];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const risk = searchParams.get('risk');

    let filteredAlerts = [...alerts];

    // Filter by status
    if (status && ['active', 'acknowledged', 'resolved'].includes(status)) {
      filteredAlerts = filteredAlerts.filter((a) => a.status === status);
    }

    // Filter by risk
    if (risk && ['low', 'medium', 'high', 'critical'].includes(risk)) {
      filteredAlerts = filteredAlerts.filter((a) => a.risk === risk);
    }

    // Sort by created date (newest first)
    filteredAlerts.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({
      alerts: filteredAlerts,
      total: filteredAlerts.length,
    });
  } catch (error) {
    console.error('Get alerts error:', error);
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
      title,
      description,
      risk,
      score,
      predictionDate,
    } = body;

    // Validate required fields
    if (
      !machineId ||
      !machineName ||
      !title ||
      !description ||
      !risk ||
      score === undefined ||
      !predictionDate
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate risk level
    if (!['low', 'medium', 'high', 'critical'].includes(risk)) {
      return NextResponse.json({ error: 'Invalid risk level' }, { status: 400 });
    }

    // Create new alert
    const newAlert: Alert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      machineId,
      machineName,
      title,
      description,
      risk: risk as AlertRisk,
      score,
      status: 'active',
      createdAt: new Date().toISOString(),
      predictionDate,
    };

    alerts.push(newAlert);

    return NextResponse.json(
      {
        message: 'Alert created successfully',
        alert: newAlert,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create alert error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Export alerts array for use in acknowledge endpoint
export { alerts };

