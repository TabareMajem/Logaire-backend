import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    const { data: agents, error } = await supabase
      .from('agent_configurations')
      .select('*')
      .order('agent_type');

    if (error) throw error;

    return NextResponse.json(agents);
  } catch (error) {
    console.error('Failed to fetch agents:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 