import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { text, type, content } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("AI service not configured");

    const inputText = text || content || "";

    let prompt: string;
    switch (type) {
      case "document":
        prompt = `Summarize this document concisely. Highlight key points, important dates, obligations, and action items:\n\n${inputText}`;
        break;
      case "expand":
        prompt = `Expand and structure this note into a well-organized document with clear sections, details, and actionable points:\n\n${inputText}`;
        break;
      case "mood_insight":
        prompt = `Based on this mood check-in, provide a brief 1-2 sentence personalized insight or encouragement. Be warm and specific:\n\n${inputText}`;
        break;
      case "weekly_review":
        prompt = `Generate a comprehensive weekly review summary based on this data. Include: highlights, areas of improvement, and 3 specific recommendations for next week. Use markdown formatting:\n\n${inputText}`;
        break;
      case "morning_briefing":
        prompt = `Generate a warm, motivating morning briefing based on this data. Include: today's priorities, reminders, and one motivational thought. Keep it concise and actionable:\n\n${inputText}`;
        break;
      default:
        prompt = `Provide a brief summary:\n\n${inputText}`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are ARIA, a helpful document analyst. Be concise and structured." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) throw new Error("AI service error");
    const data = await response.json();
    const summary = data.choices?.[0]?.message?.content || "Unable to generate summary.";

    return new Response(JSON.stringify({ summary }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
