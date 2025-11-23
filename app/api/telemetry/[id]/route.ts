import { NextRequest, NextResponse } from 'next/server';

interface TelemetryData {
  air_temperature: number;
  process_temperature: number;
  rotational_speed: number;
  torque: number;
  tool_wear: number;
  type: number;
  timestamp: string;
}

// Machine characteristics for realistic telemetry generation
const machineCharacteristics: Record<string, {
  baseTemp: number;
  baseSpeed: number;
  baseTorque: number;
  wearRate: number;
  type: number;
  status: 'operational' | 'warning' | 'maintenance';
}> = {
  '1': { baseTemp: 300, baseSpeed: 1500, baseTorque: 40, wearRate: 0.1, type: 0, status: 'operational' },
  '2': { baseTemp: 305, baseSpeed: 1800, baseTorque: 45, wearRate: 0.3, type: 1, status: 'warning' },
  '3': { baseTemp: 298, baseSpeed: 1400, baseTorque: 38, wearRate: 0.05, type: 2, status: 'operational' },
  '4': { baseTemp: 310, baseSpeed: 1600, baseTorque: 42, wearRate: 0.5, type: 0, status: 'maintenance' },
  '5': { baseTemp: 302, baseSpeed: 1700, baseTorque: 43, wearRate: 0.15, type: 1, status: 'operational' },
  '6': { baseTemp: 308, baseSpeed: 1900, baseTorque: 48, wearRate: 0.4, type: 2, status: 'warning' },
};

/**
 * Generate dynamic telemetry data based on machine ID, date range, and machine characteristics
 */
function generateTelemetry(
  machineId: string,
  startDate: string,
  endDate: string
): TelemetryData {
  const machine = machineCharacteristics[machineId] || machineCharacteristics['1'];
  const seed = parseInt(machineId) || 1;
  
  // Calculate days in range for time-based variation
  const start = new Date(startDate);
  const end = new Date(endDate);
  const daysDiff = Math.max(1, Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  
  // Generate time-based variation (simulate sensor readings over time)
  // Use date range to create realistic variations
  const startTime = start.getTime();
  const endTime = end.getTime();
  const midTime = (startTime + endTime) / 2;
  const timeVariation = Math.sin((midTime / (1000 * 60 * 60 * 24)) * 0.1) * 5;
  const randomVariation = (Math.random() - 0.5) * 10;
  
  // Add date-based degradation (machines degrade over time)
  const daysSinceStart = Math.floor((Date.now() - startTime) / (1000 * 60 * 60 * 24));
  const degradationFactor = 1 + (daysSinceStart * 0.001); // Small degradation over time
  
  // Base values from machine characteristics with dynamic variations
  let airTemp = machine.baseTemp + timeVariation + randomVariation;
  let processTemp = machine.baseTemp + 10 + timeVariation * 1.2 + randomVariation * 1.5;
  let rotationalSpeed = machine.baseSpeed + (Math.random() - 0.5) * 200;
  let torque = machine.baseTorque + (Math.random() - 0.5) * 10;
  
  // Calculate tool wear based on time, machine wear rate, and date range
  // More days = more wear, but also consider the specific date range
  const baseWear = daysDiff * machine.wearRate * degradationFactor;
  const wearVariation = (Math.random() - 0.5) * 20;
  let toolWear = Math.max(0, baseWear + wearVariation);
  
  // Add realistic operational patterns (machines have cycles)
  const operationalCycle = Math.sin((midTime / (1000 * 60 * 60)) * 0.1); // Hourly cycle
  rotationalSpeed += operationalCycle * 50;
  torque += operationalCycle * 2;
  
  // Adjust based on machine status
  if (machine.status === 'warning') {
    processTemp += 5; // Higher temperature
    toolWear += 10; // More wear
    torque -= 2; // Lower torque (potential issue)
  } else if (machine.status === 'maintenance') {
    processTemp += 8; // Even higher temperature
    toolWear += 25; // Significant wear
    rotationalSpeed -= 50; // Reduced speed
    torque -= 5; // Lower torque
  }
  
  // Add some realistic noise and constraints
  airTemp = Math.max(295, Math.min(315, airTemp));
  processTemp = Math.max(305, Math.min(325, processTemp));
  rotationalSpeed = Math.max(1200, Math.min(2200, rotationalSpeed));
  torque = Math.max(30, Math.min(60, torque));
  toolWear = Math.max(0, Math.min(300, toolWear));
  
  return {
    air_temperature: Math.round(airTemp * 10) / 10,
    process_temperature: Math.round(processTemp * 10) / 10,
    rotational_speed: Math.round(rotationalSpeed),
    torque: Math.round(torque * 10) / 10,
    tool_wear: Math.round(toolWear * 10) / 10,
    type: machine.type,
    timestamp: new Date().toISOString(),
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

    const telemetry = generateTelemetry(params.id, startDate, endDate);

    return NextResponse.json({
      machineId: params.id,
      telemetry,
      dateRange: { startDate, endDate },
    });
  } catch (error) {
    console.error('Telemetry generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

