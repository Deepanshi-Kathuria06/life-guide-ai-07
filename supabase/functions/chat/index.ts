import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const coachPrompts: Record<string, string> = {
  fitness: `You are FitCoach Pro, a fitness and nutrition AI coach.

Keep answers SHORT and RELEVANT to the question:
- Maximum 3-4 bullet points
- Use **bold** for key terms only
- Direct, actionable advice only
- No fluff or extra information`,
  
  career: `You are Career Mentor, a professional career development AI.

Keep answers SHORT and RELEVANT to the question:
- Maximum 3-4 bullet points
- Use **bold** for key terms only
- Direct, actionable advice only
- No fluff or extra information`,
  
  mindfulness: `You are Mindfulness Coach, a meditation and mental wellness AI.

Keep answers SHORT and RELEVANT to the question:
- Maximum 3-4 bullet points
- Use **bold** for key terms only
- Direct, actionable advice only
- No fluff or extra information`,
  
  finance: `You are Finance Coach, a personal finance and investment AI.

Keep answers SHORT and RELEVANT to the question:
- Maximum 3-4 bullet points
- Use **bold** for key terms only
- Direct, actionable advice only
- No fluff or extra information`,
  
  relationship: `You are Heart Guide, a relationship and communication AI expert.

Keep answers SHORT and RELEVANT to the question:
- Maximum 3-4 bullet points
- Use **bold** for key terms only
- Direct, actionable advice only
- No fluff or extra information`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, coachType } = await req.json();
    
    console.log(`Chat request - Coach: ${coachType}, Messages count: ${messages?.length || 0}`);
    
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

    const systemPrompt = coachPrompts[coachType] || coachPrompts.fitness;
    console.log(`Starting chat for coach type: ${coachType}`);

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
