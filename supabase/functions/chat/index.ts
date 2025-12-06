import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.1';
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const baseInstructions = `
CRITICAL - LANGUAGE DETECTION & RESPONSE RULE (MUST FOLLOW):
1. DETECT the language of the user's LAST message
2. ALWAYS respond in the EXACT SAME language
3. Examples:
   - User writes in Hindi → Respond in Hindi
   - User writes in Spanish → Respond in Spanish
   - User writes in English → Respond in English
   - User writes in Hinglish (Hindi+English mix) → Respond in same Hinglish style
4. NEVER ignore this rule. Language matching is MANDATORY.

RESPONSE FORMAT (ChatGPT Style):
- Give balanced, relevant answers - not too long, not too short
- Structure responses with clear paragraphs
- Use **bold** for key terms and important points
- Use line breaks between different ideas for readability
- Be conversational and helpful
- Stay focused on answering the specific question asked
- Include actionable advice when relevant
- Avoid unnecessary filler or overly verbose explanations
`;

const coachPrompts: Record<string, string> = {
  fitness: `You are FitCoach Pro, an expert fitness and nutrition AI coach.
${baseInstructions}
Your expertise: exercise science, sports nutrition, workout planning, injury prevention, and holistic wellness.
Tone: Warm, encouraging, and motivating.`,
  
  career: `You are Career Mentor, an expert professional career development AI.
${baseInstructions}
Your expertise: career strategy, job searching, interview prep, leadership, salary negotiation, and workplace dynamics.
Tone: Professional, supportive, and strategic.`,
  
  mindfulness: `You are Mindfulness Coach, an expert meditation and mental wellness AI.
${baseInstructions}
Your expertise: mindfulness practices, meditation techniques, stress management, emotional intelligence, and mental well-being.
Tone: Calm, gentle, and nurturing.`,
  
  finance: `You are Finance Coach, an expert personal finance and investment AI.
${baseInstructions}
Your expertise: budgeting, saving, investing, debt management, retirement planning, and wealth building.
Tone: Clear, confident, and educational.`,
  
  relationship: `You are Heart Guide, an expert relationship and communication AI.
${baseInstructions}
Your expertise: relationship psychology, communication strategies, conflict resolution, emotional intelligence, and interpersonal dynamics.
Tone: Empathetic, warm, and understanding.`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, coachType, chatId, userId } = await req.json();
    
    console.log(`Chat request - Coach: ${coachType}, Messages count: ${messages?.length || 0}, ChatId: ${chatId}`);
    
    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "Messages array is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build memory context from previous chats
    let memoryContext = "";
    if (chatId && userId) {
      try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Get previous chats for this coach type (excluding current chat)
        const { data: previousChats } = await supabase
          .from('chats')
          .select('id, title, created_at')
          .eq('user_id', userId)
          .eq('coach_type', coachType)
          .neq('id', chatId)
          .order('updated_at', { ascending: false })
          .limit(5);

        if (previousChats && previousChats.length > 0) {
          // Get recent messages from previous chats for context
          const chatIds = previousChats.map(c => c.id);
          const { data: previousMessages } = await supabase
            .from('messages')
            .select('content, role, chat_id, created_at')
            .in('chat_id', chatIds)
            .order('created_at', { ascending: false })
            .limit(20);

          if (previousMessages && previousMessages.length > 0) {
            // Group messages by chat and create summaries
            const chatSummaries = previousChats.map(chat => {
              const chatMsgs = previousMessages.filter(m => m.chat_id === chat.id);
              if (chatMsgs.length === 0) return null;
              
              // Get the first few exchanges
              const summary = chatMsgs
                .reverse()
                .slice(0, 6)
                .map(m => `${m.role}: ${m.content.substring(0, 150)}`)
                .join('\n');
              
              return `Previous conversation (${new Date(chat.created_at).toLocaleDateString()}):\n${summary}`;
            }).filter(Boolean).join('\n\n');

            if (chatSummaries) {
              memoryContext = `\n\nPREVIOUS CONVERSATION CONTEXT (use this to provide personalized, context-aware responses):\n${chatSummaries}\n\nRemember these past conversations when responding. Reference them naturally when relevant to show continuity and personalization.`;
            }
          }
        }
      } catch (error) {
        console.error('Error loading memory context:', error);
        // Continue without memory context if there's an error
      }
    }

    const basePrompt = coachPrompts[coachType] || coachPrompts.fitness;
    const systemPrompt = basePrompt + memoryContext;
    console.log(`Starting chat for coach type: ${coachType} with memory: ${memoryContext ? 'YES' : 'NO'}`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Lovable AI error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: `AI service error: ${errorText}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});