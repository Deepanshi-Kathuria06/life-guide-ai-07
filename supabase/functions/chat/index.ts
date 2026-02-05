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

YOU ARE AN AGENTIC AI COACH - USE YOUR TOOLS PROACTIVELY!

AGENTIC BEHAVIOR (CRITICAL):
- When user mentions wanting to do something → USE create_task tool IMMEDIATELY
- When user reports completing something → USE update_task_status tool
- When you want to understand user's progress → USE get_user_tasks tool
- Be PROACTIVE - don't just talk, TAKE ACTION!
- Create tasks for ANY actionable item mentioned in conversation
- Always acknowledge when you've created/updated tasks

RESPONSE FORMAT:
- Give balanced, relevant answers - not too long, not too short
- Use **bold** for key terms and important points
- Be conversational and helpful
- After using tools, tell the user what action you took
`;

const coachPrompts: Record<string, string> = {
  fitness: `You are FitCoach Pro, an AGENTIC fitness and nutrition AI coach.
${baseInstructions}
Your expertise: exercise science, sports nutrition, workout planning, injury prevention, and holistic wellness.

AGENTIC ACTIONS FOR FITNESS:
- When user mentions a workout goal → CREATE TASK with appropriate priority
- When user says they completed an exercise → UPDATE TASK STATUS
- Track workouts, nutrition goals, and fitness milestones as tasks
- Be proactive: "I'll add that to your fitness tasks!"

Tone: Warm, encouraging, and motivating.`,
  
  career: `You are Career Mentor, an AGENTIC professional career development AI.
${baseInstructions}
Your expertise: career strategy, job searching, interview prep, leadership, salary negotiation, and workplace dynamics.

AGENTIC ACTIONS FOR CAREER:
- When user mentions a career goal → CREATE TASK immediately
- When user reports completing a professional task → UPDATE STATUS
- Track job applications, skill development, and networking as tasks
- Be proactive: "I've added that to your career action items!"

Tone: Professional, supportive, and strategic.`,
  
  mindfulness: `You are Mindfulness Coach, an AGENTIC meditation and mental wellness AI.
${baseInstructions}
Your expertise: mindfulness practices, meditation techniques, stress management, emotional intelligence, and mental well-being.

AGENTIC ACTIONS FOR MINDFULNESS:
- When user wants to build a meditation habit → CREATE TASK
- When user reports completing a mindfulness practice → UPDATE STATUS
- Track meditation sessions, breathing exercises, and wellness goals
- Be proactive: "I'll track that mindfulness goal for you!"

Tone: Calm, gentle, and nurturing.`,
  
  finance: `You are Finance Coach, an AGENTIC personal finance and investment AI.
${baseInstructions}
Your expertise: budgeting, saving, investing, debt management, retirement planning, and wealth building.

AGENTIC ACTIONS FOR FINANCE:
- When user mentions a savings goal → CREATE TASK with due date
- When user reports financial progress → UPDATE TASK STATUS
- Track budgets, investments, and financial milestones as tasks
- Be proactive: "I've added that to your financial action plan!"

Tone: Clear, confident, and educational.`,
  
  relationship: `You are Heart Guide, an AGENTIC relationship and communication AI.
${baseInstructions}
Your expertise: relationship psychology, communication strategies, conflict resolution, emotional intelligence, and interpersonal dynamics.

AGENTIC ACTIONS FOR RELATIONSHIPS:
- When user mentions relationship goals → CREATE TASK
- When user reports relationship progress → UPDATE STATUS
- Track communication goals, date nights, and relationship milestones
- Be proactive: "I'll help you track that relationship goal!"

Tone: Empathetic, warm, and understanding.`,
};

const agenticTools = [
  {
    type: "function",
    function: {
      name: "create_task",
      description: "Create a new task for the user. Use this when the user mentions something they want to do, achieve, or when you want to help them with actionable steps. Be proactive!",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "Short, actionable task title" },
          description: { type: "string", description: "Detailed description of the task" },
          priority: { type: "string", enum: ["low", "medium", "high", "urgent"], description: "Task priority level" },
          due_date: { type: "string", description: "Optional due date in ISO format" }
        },
        required: ["title", "priority"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "update_task_status",
      description: "Update the status of an existing task. Use when user reports completing something or making progress.",
      parameters: {
        type: "object",
        properties: {
          task_id: { type: "string", description: "ID of the task to update" },
          status: { type: "string", enum: ["pending", "in_progress", "completed", "skipped"], description: "New status" }
        },
        required: ["task_id", "status"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_user_tasks",
      description: "Get the user's current tasks. Use this to understand what they're working on and provide contextual advice.",
      parameters: {
        type: "object",
        properties: {
          status_filter: { type: "string", enum: ["all", "pending", "completed"], description: "Filter by status" }
        }
      }
    }
  }
];

async function executeToolCall(
  toolName: string, 
  args: any, 
  userId: string, 
  coachType: string, 
  chatId: string,
  supabase: any
): Promise<{ success: boolean; result: any; message: string }> {
  console.log(`Executing tool: ${toolName} with args:`, args);
  
  try {
    if (toolName === "create_task") {
      const { data, error } = await supabase
        .from("coach_tasks")
        .insert({
          user_id: userId,
          coach_type: coachType,
          chat_id: chatId,
          title: args.title,
          description: args.description || null,
          priority: args.priority || "medium",
          due_date: args.due_date || null,
          ai_generated: true,
          status: "pending"
        })
        .select()
        .single();
      
      if (error) throw error;
      return { success: true, result: data, message: `Created task: "${args.title}"` };
    }
    
    if (toolName === "update_task_status") {
      const { data, error } = await supabase
        .from("coach_tasks")
        .update({
          status: args.status,
          completed_at: args.status === "completed" ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq("id", args.task_id)
        .eq("user_id", userId)
        .select()
        .single();
      
      if (error) throw error;
      return { success: true, result: data, message: `Updated task status to: ${args.status}` };
    }
    
    if (toolName === "get_user_tasks") {
      let query = supabase
        .from("coach_tasks")
        .select("*")
        .eq("user_id", userId)
        .eq("coach_type", coachType)
        .order("created_at", { ascending: false })
        .limit(10);
      
      if (args.status_filter === "pending") {
        query = query.neq("status", "completed");
      } else if (args.status_filter === "completed") {
        query = query.eq("status", "completed");
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return { success: true, result: data, message: `Retrieved ${data?.length || 0} tasks` };
    }
    
    return { success: false, result: null, message: "Unknown tool" };
  } catch (error) {
    console.error(`Tool execution error:`, error);
    return { success: false, result: null, message: error.message };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, coachType, chatId, userId } = await req.json();
    
    console.log(`Agentic chat request - Coach: ${coachType}, Messages: ${messages?.length || 0}`);
    
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

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Build context from previous chats and current tasks
    let contextInfo = "";
    
    if (userId && coachType) {
      // Get current tasks
      const { data: currentTasks } = await supabase
        .from("coach_tasks")
        .select("id, title, status, priority, due_date")
        .eq("user_id", userId)
        .eq("coach_type", coachType)
        .neq("status", "completed")
        .order("created_at", { ascending: false })
        .limit(5);
      
      if (currentTasks && currentTasks.length > 0) {
        contextInfo += `\n\nUSER'S CURRENT TASKS (refer to these, update them when relevant):\n`;
        currentTasks.forEach((t: any) => {
          contextInfo += `- [${t.id}] "${t.title}" (${t.priority}, ${t.status})${t.due_date ? ` Due: ${t.due_date}` : ''}\n`;
        });
      }

      // Get memory from previous chats
      if (chatId) {
        const { data: previousChats } = await supabase
          .from('chats')
          .select('id, title, created_at')
          .eq('user_id', userId)
          .eq('coach_type', coachType)
          .neq('id', chatId)
          .order('updated_at', { ascending: false })
          .limit(3);

        if (previousChats && previousChats.length > 0) {
          const chatIds = previousChats.map((c: any) => c.id);
          const { data: previousMessages } = await supabase
            .from('messages')
            .select('content, role, chat_id')
            .in('chat_id', chatIds)
            .order('created_at', { ascending: false })
            .limit(10);

          if (previousMessages && previousMessages.length > 0) {
            contextInfo += `\n\nPREVIOUS CONVERSATION MEMORY:\n`;
            previousMessages.slice(0, 6).forEach((m: any) => {
              contextInfo += `${m.role}: ${m.content.substring(0, 100)}...\n`;
            });
          }
        }
      }
    }

    const basePrompt = coachPrompts[coachType] || coachPrompts.fitness;
    const systemPrompt = basePrompt + contextInfo;

    // First API call with tools (non-streaming to check for tool calls)
    const initialResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
        tools: agenticTools,
        tool_choice: "auto",
      }),
    });

    if (!initialResponse.ok) {
      const errorText = await initialResponse.text();
      console.error("AI error:", initialResponse.status, errorText);
      throw new Error(`AI service error: ${errorText}`);
    }

    const initialData = await initialResponse.json();
    const assistantMessage = initialData.choices?.[0]?.message;
    
    // Check if there are tool calls
    if (assistantMessage?.tool_calls && assistantMessage.tool_calls.length > 0 && userId) {
      console.log(`Processing ${assistantMessage.tool_calls.length} tool calls`);
      
      const toolResults = [];
      for (const toolCall of assistantMessage.tool_calls) {
        const args = JSON.parse(toolCall.function.arguments);
        const result = await executeToolCall(
          toolCall.function.name, 
          args, 
          userId, 
          coachType, 
          chatId,
          supabase
        );
        toolResults.push({
          tool_call_id: toolCall.id,
          role: "tool",
          content: JSON.stringify(result)
        });
      }

      // Second API call with tool results (streaming)
      const followUpMessages = [
        { role: "system", content: systemPrompt },
        ...messages,
        assistantMessage,
        ...toolResults
      ];

      const streamResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: followUpMessages,
          stream: true,
        }),
      });

      if (!streamResponse.ok) {
        throw new Error("Failed to get follow-up response");
      }

      return new Response(streamResponse.body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    // No tool calls - stream the regular response
    const streamResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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

    if (!streamResponse.ok) {
      const errorText = await streamResponse.text();
      throw new Error(`AI service error: ${errorText}`);
    }

    return new Response(streamResponse.body, {
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
