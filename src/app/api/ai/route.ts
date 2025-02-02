import { errorHandler } from '@/middleware/error-handler';
import { AIService } from '@/services/ai-service';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const aiService = new AIService();

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { agentType, task } = body;

    const result = await aiService.executeTask(agentType, task, {
      userId: session.user.id
    });

    return NextResponse.json(result);
  } catch (error) {
    return errorHandler(error);
  }
} 