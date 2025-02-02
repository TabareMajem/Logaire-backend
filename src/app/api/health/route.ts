import { SystemHealthService } from '@/services/system-health-service';
import { NextResponse } from 'next/server';

export async function GET() {
  const healthService = new SystemHealthService();
  const health = await healthService.checkHealth();
  return NextResponse.json(health);
} 