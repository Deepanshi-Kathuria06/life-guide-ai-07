import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Bytez from "https://cdn.jsdelivr.net/npm/bytez.js@latest/+esm";

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

    const BYTEZ_API_KEY = Deno.env.get("BYTEZ_API_KEY");
    if (!BYTEZ_API_KEY) {
      console.error("BYTEZ_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = coachPrompts[coachType] || coachPrompts.fitness;
    console.log(`Starting chat for coach type: ${coachType}`);

    // Initialize Bytez SDK
    const sdk = new Bytez(BYTEZ_API_KEY);
    const model = sdk.model("openai/gpt-4.1");

    // Prepare messages with system prompt
    const chatMessages = [
      { role: "system", content: systemPrompt },
      ...messages
    ];

    console.log("Sending request to Bytez API...");

    // Run the model
    const { error, output } = await model.run(chatMessages);

    if (error) {
      console.error("Bytez API error:", error);
      return new Response(
        JSON.stringify({ error: "AI service error. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Received response from Bytez API");

    // Convert Bytez output to SSE stream format
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        const content = output?.content || output?.message?.content || output;
        const text = typeof content === 'string' ? content : JSON.stringify(content);
        
        // Send in OpenAI-compatible SSE format
        const payload = {
          choices: [{
            delta: { content: text },
            index: 0,
          }],
        };
        
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
        controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
        controller.close();
      }
    });

    return new Response(stream, {
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
