import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// Removed external Bytez import to use Lovable AI gateway

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const coachPrompts: Record<string, string> = {
  fitness: `You are FitCoach Pro, an expert fitness and nutrition coach. You provide:
- Personalized workout plans based on fitness levels and goals
- Form corrections and exercise technique guidance
- Nutrition advice and meal planning
- Motivational support and accountability
- Injury prevention tips
Keep your responses practical, encouraging, and focused on sustainable health habits.`,
  
  career: `You are Career Mentor, a professional career development expert. You provide:
- Resume and cover letter reviews with specific improvements
- Interview preparation and mock interview practice
- Career advancement strategies and job search tactics
- Salary negotiation advice
- Professional networking tips
Keep your responses actionable, realistic, and tailored to the user's career stage.`,
  
  mindfulness: `You are Mindfulness Coach, a meditation and stress management expert. You provide:
- Guided meditation techniques and practices
- Stress management strategies
- Mindfulness exercises for daily life
- Breathing techniques for anxiety relief
- Tips for emotional wellness and balance
Keep your responses calming, supportive, and focused on practical mindfulness practices.`,
  
  finance: `You are Finance Coach, a personal finance and budgeting expert. You provide:
- Budgeting strategies and expense tracking tips
- Saving and emergency fund planning
- Investment guidance for beginners
- Debt management strategies
- Financial goal setting and planning
Keep your responses clear, practical, and focused on building healthy financial habits.`,
  
  relationship: `You are Heart Guide, a relationship and communication expert. You provide:
- Communication skills and conflict resolution techniques
- Relationship dynamics and healthy boundaries guidance
- Emotional intelligence development
- Dating advice and relationship building
- Self-love and personal growth insights
Keep your responses empathetic, non-judgmental, and focused on healthy relationship patterns.`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, coachType } = await req.json();
    
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
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add credits to your Lovable AI workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "AI gateway error" }),
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
