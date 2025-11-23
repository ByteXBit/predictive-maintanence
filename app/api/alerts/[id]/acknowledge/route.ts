import { NextRequest, NextResponse } from 'next/server';
import { alerts } from '../../route';

interface AcknowledgeRequest {
  userId: string;
  userEmail: string;
  userRole: string;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { userId, userEmail, userRole } = body as AcknowledgeRequest;

    // Validate required fields
    if (!userId || !userEmail || !userRole) {
      return NextResponse.json(
        { error: 'Missing user information' },
        { status: 400 }
      );
    }

    // Find the alert
    const alertIndex = alerts.findIndex((a) => a.id === params.id);

    if (alertIndex === -1) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
    }

    const alert = alerts[alertIndex];

    // Check if alert is already acknowledged or resolved
    if (alert.status === 'acknowledged' || alert.status === 'resolved') {
      return NextResponse.json(
        { error: `Alert is already ${alert.status}` },
        { status: 400 }
      );
    }

    // Update alert status
    alerts[alertIndex] = {
      ...alert,
      status: 'acknowledged',
      acknowledgedAt: new Date().toISOString(),
      acknowledgedBy: {
        id: userId,
        email: userEmail,
        role: userRole,
      },
    };

    return NextResponse.json({
      message: 'Alert acknowledged successfully',
      alert: alerts[alertIndex],
    });
  } catch (error) {
    console.error('Acknowledge alert error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

