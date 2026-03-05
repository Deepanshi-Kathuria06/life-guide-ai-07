import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, userId, conversationId } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("AI service not configured");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch user profile for context
    let userContext = "";
    if (userId) {
      const { data: profile } = await supabase
        .from("aria_profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (profile) {
        userContext += `\nUser's name: ${profile.name || "Unknown"}`;
        userContext += `\nLife goals: ${profile.goals_summary || "Not specified"}`;
        userContext += `\nWork situation: ${profile.work_situation || "Not specified"}`;
        userContext += `\nChallenges: ${profile.challenges || "Not specified"}`;
        userContext += `\nPreferred style: ${profile.communication_style || "casual"}`;
        if (profile.aria_context_summary) {
          userContext += `\nPrevious context summary: ${profile.aria_context_summary}`;
        }
      }

      // Fetch active goals
      const { data: goals } = await supabase
        .from("aria_goals")
        .select("title, category, progress_percent, target_date")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(5);

      if (goals?.length) {
        userContext += `\n\nActive goals:`;
        goals.forEach((g: any) => {
          userContext += `\n- ${g.title} (${g.category}, ${g.progress_percent}% done${g.target_date ? `, target: ${g.target_date}` : ""})`;
        });
      }

      // Fetch pending tasks
      const { data: tasks } = await supabase
        .from("aria_tasks")
        .select("title, priority, due_at, status, category")
        .eq("user_id", userId)
        .neq("status", "done")
        .order("due_at", { ascending: true, nullsFirst: false })
        .limit(10);

      if (tasks?.length) {
        const overdue = tasks.filter((t: any) => t.due_at && new Date(t.due_at) < new Date());
        userContext += `\n\nPending tasks: ${tasks.length} (${overdue.length} overdue)`;
        tasks.slice(0, 5).forEach((t: any) => {
          userContext += `\n- [${t.priority}] ${t.title} (${t.category}${t.due_at ? `, due: ${t.due_at}` : ""})`;
        });
      }
    }

    const now = new Date();
    const timeOfDay = now.getHours() < 12 ? "morning" : now.getHours() < 17 ? "afternoon" : "evening";

    const systemPrompt = `You are ARIA, an intelligent personal life operating system. You act simultaneously as the user's life coach, personal assistant, company secretary, task manager, and accountability partner.

${userContext}

Current date and time: ${now.toISOString()}
Time of day: ${timeOfDay}

Your personality:
- Warm but direct — you give concrete action steps, not vague advice
- Proactive — anticipate needs and suggest next actions
- Organized — structure advice with bullet points and numbered lists
- Empathetic — acknowledge emotions before problem-solving
- Ask ONE clarifying question at a time when needed

You can help with: life decisions, career advice, relationship guidance, financial planning, health habits, scheduling, document management, task prioritization, emotional support, business correspondence, legal document explanation, daily accountability.

TASK DETECTION:
When the user mentions wanting to do something by a specific time or date, respond naturally AND add this exact marker at the end of your response:
[TASK_DETECTED]{"title":"task title","description":"optional description","due_at":"ISO date or null","priority":"low|medium|high","category":"work|personal|health|finance|other"}[/TASK_DETECTED]

Always confirm tasks naturally in your response like: "I'll note that down for you — [task details]."

RESPONSE FORMAT:
- Use **bold** for key terms
- Use markdown formatting for structure
- Keep responses conversational but substantive
- Be concise unless the user asks for detailed analysis`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI service error");
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("aria-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
