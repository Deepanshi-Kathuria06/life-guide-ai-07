import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { chatId, coachType } = await req.json();
    
    const authHeader = req.headers.get('Authorization')!;
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get recent messages from this chat
    const { data: messages, error: messagesError } = await supabaseClient
      .from('messages')
      .select('content, role, created_at')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (messagesError) throw messagesError;
    if (!messages || messages.length === 0) {
      return new Response(
        JSON.stringify({ tasks: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');

    const coachContext: Record<string, string> = {
      fitness: "fitness goals like workout routines, nutrition plans, exercise targets",
      career: "career goals like skill development, networking, job applications, promotions",
      mindfulness: "mindfulness goals like meditation practice, stress reduction, emotional balance",
      finance: "financial goals like budgeting, saving targets, investment plans, debt reduction",
      relationship: "relationship goals like communication improvements, quality time, conflict resolution"
    };

    const conversationText = messages
      .reverse()
      .map(m => `${m.role}: ${m.content}`)
      .join('\n');

    const systemPrompt = `You are an expert task extractor for a ${coachType} coach. Analyze this conversation and extract 3-5 actionable tasks the user should work on.

Focus on ${coachContext[coachType] || "personal development goals"}.

Return a JSON array of tasks with this structure:
{
  "tasks": [
    {
      "title": "Brief task title (max 50 chars)",
      "description": "One sentence description",
      "priority": "low" | "medium" | "high" | "urgent",
      "timeframe": "today" | "this_week" | "this_month"
    }
  ]
}

Only extract tasks that are:
1. Specific and actionable
2. Directly mentioned or implied by the user
3. Relevant to ${coachType} coaching

If no clear tasks can be extracted, return {"tasks": []}`;

    console.log(`Extracting tasks for chat ${chatId}, coach: ${coachType}`);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Extract tasks from this ${coachType} coaching conversation:\n\n${conversationText}` }
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limits exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error('AI request failed');
    }

    const data = await response.json();
    let content = data.choices[0].message.content;
    
    // Clean up markdown formatting if present
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const result = JSON.parse(content);
    console.log(`Extracted ${result.tasks?.length || 0} tasks`);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error extracting tasks:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
