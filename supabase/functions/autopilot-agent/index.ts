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
    const { action, payload } = await req.json();
    
    const authHeader = req.headers.get('Authorization')!;
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');

    if (action === 'generate_plan') {
      return await generatePlan(supabaseClient, user.id, payload, LOVABLE_API_KEY);
    } else if (action === 'generate_daily_tasks') {
      return await generateDailyTasks(supabaseClient, user.id, payload, LOVABLE_API_KEY);
    } else if (action === 'generate_weekly_report') {
      return await generateWeeklyReport(supabaseClient, user.id, payload, LOVABLE_API_KEY);
    } else if (action === 'analyze_behavior') {
      return await analyzeBehavior(supabaseClient, user.id, payload, LOVABLE_API_KEY);
    } else {
      throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error('Autopilot agent error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function callAI(apiKey: string, systemPrompt: string, userPrompt: string) {
  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
    }),
  });

  if (!response.ok) {
    if (response.status === 429) {
      return { error: 'Rate limits exceeded. Please try again later.', status: 429 };
    }
    if (response.status === 402) {
      return { error: 'AI credits exhausted. Please add credits.', status: 402 };
    }
    throw new Error('AI request failed');
  }

  const data = await response.json();
  let content = data.choices[0].message.content;
  content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return { result: JSON.parse(content) };
}

async function generatePlan(supabase: any, userId: string, payload: any, apiKey: string) {
  const { goalDescription, deadline, dailyTime, difficulty, challenges, motivationType } = payload;

  const systemPrompt = `You are an autonomous life optimization agent. Create a detailed, actionable plan.
Return JSON:
{
  "milestones": [
    {
      "title": "string",
      "description": "string", 
      "target_date": "YYYY-MM-DD",
      "tasks": ["string"],
      "metrics": ["string"]
    }
  ],
  "daily_schedule": {
    "morning": ["task"],
    "afternoon": ["task"],
    "evening": ["task"]
  },
  "first_week_tasks": [
    {
      "task_text": "string",
      "priority": "high|medium|low",
      "day": 1
    }
  ],
  "motivational_note": "string",
  "estimated_completion": "YYYY-MM-DD",
  "difficulty_assessment": "string"
}`;

  const userPrompt = `Create a plan for:
Goal: ${goalDescription}
Deadline: ${deadline || 'Flexible'}
Daily available time: ${dailyTime} minutes
Difficulty preference: ${difficulty}
Challenges: ${challenges || 'None specified'}
Motivation type: ${motivationType || 'Achievement-oriented'}`;

  const aiResponse = await callAI(apiKey, systemPrompt, userPrompt);
  if (aiResponse.error) {
    return new Response(JSON.stringify({ error: aiResponse.error }), {
      status: aiResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const plan = aiResponse.result;

  // Save goal with plan
  const { data: goal, error: goalError } = await supabase
    .from('autopilot_goals')
    .insert({
      user_id: userId,
      goal_description: goalDescription,
      deadline: deadline || null,
      daily_time_minutes: dailyTime,
      difficulty,
      challenges: challenges || null,
      motivation_type: motivationType || null,
      milestones: plan.milestones,
      ai_plan: plan,
      last_active_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (goalError) throw goalError;

  // Create first week tasks
  if (plan.first_week_tasks) {
    const today = new Date();
    const tasks = plan.first_week_tasks.map((t: any) => {
      const dueDate = new Date(today);
      dueDate.setDate(today.getDate() + (t.day - 1));
      return {
        goal_id: goal.id,
        user_id: userId,
        task_text: t.task_text,
        due_date: dueDate.toISOString().split('T')[0],
        priority: t.priority || 'medium',
      };
    });

    await supabase.from('autopilot_tasks').insert(tasks);
  }

  // Create welcome notification
  await supabase.from('autopilot_notifications').insert({
    user_id: userId,
    goal_id: goal.id,
    type: 'welcome',
    title: '🚀 Autopilot Activated!',
    message: `Your plan for "${goalDescription}" is ready. ${plan.motivational_note}`,
  });

  return new Response(
    JSON.stringify({ goal, plan }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function generateDailyTasks(supabase: any, userId: string, payload: any, apiKey: string) {
  const { goalId } = payload;

  const { data: goal } = await supabase
    .from('autopilot_goals')
    .select('*')
    .eq('id', goalId)
    .eq('user_id', userId)
    .maybeSingle();

  if (!goal) throw new Error('Goal not found');

  // Get recent activity
  const { data: recentTasks } = await supabase
    .from('autopilot_tasks')
    .select('*')
    .eq('goal_id', goalId)
    .order('created_at', { ascending: false })
    .limit(14);

  const completedCount = recentTasks?.filter((t: any) => t.completed).length || 0;
  const totalCount = recentTasks?.length || 0;
  const recentRate = totalCount > 0 ? (completedCount / totalCount * 100) : 0;

  const systemPrompt = `You are an autonomous life optimization agent. Generate today's tasks based on the user's goal and recent performance.
If completion rate is below 50%, reduce difficulty. If above 80%, increase challenge.

Return JSON:
{
  "tasks": [
    {
      "task_text": "string",
      "priority": "high|medium|low"
    }
  ],
  "adjustment_reason": "string or null",
  "encouragement": "string"
}`;

  const userPrompt = `Goal: ${goal.goal_description}
Difficulty: ${goal.difficulty}
Daily time: ${goal.daily_time_minutes} minutes
Recent completion rate: ${recentRate.toFixed(0)}%
Recent tasks: ${JSON.stringify(recentTasks?.slice(0, 7).map((t: any) => ({ text: t.task_text, completed: t.completed })))}
Milestones: ${JSON.stringify(goal.milestones)}`;

  const aiResponse = await callAI(apiKey, systemPrompt, userPrompt);
  if (aiResponse.error) {
    return new Response(JSON.stringify({ error: aiResponse.error }), {
      status: aiResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const result = aiResponse.result;
  const today = new Date().toISOString().split('T')[0];

  if (result.tasks) {
    const tasks = result.tasks.map((t: any) => ({
      goal_id: goalId,
      user_id: userId,
      task_text: t.task_text,
      due_date: today,
      priority: t.priority || 'medium',
      adjustment_flag: !!result.adjustment_reason,
      adjustment_reason: result.adjustment_reason || null,
    }));

    await supabase.from('autopilot_tasks').insert(tasks);
  }

  // Update last active
  await supabase.from('autopilot_goals').update({ last_active_at: new Date().toISOString() }).eq('id', goalId);

  return new Response(
    JSON.stringify(result),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function generateWeeklyReport(supabase: any, userId: string, payload: any, apiKey: string) {
  const { goalId } = payload;

  const { data: goal } = await supabase
    .from('autopilot_goals')
    .select('*')
    .eq('id', goalId)
    .eq('user_id', userId)
    .maybeSingle();

  if (!goal) throw new Error('Goal not found');

  // Get this week's tasks
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekStartStr = weekStart.toISOString().split('T')[0];

  const { data: weekTasks } = await supabase
    .from('autopilot_tasks')
    .select('*')
    .eq('goal_id', goalId)
    .gte('due_date', weekStartStr);

  const completed = weekTasks?.filter((t: any) => t.completed).length || 0;
  const total = weekTasks?.length || 1;
  const rate = (completed / total * 100);

  const systemPrompt = `You are generating a weekly performance report.
Return JSON:
{
  "summary": "string (2-3 sentences)",
  "performance_score": number (0-100),
  "completion_rate": number,
  "insights": ["string"],
  "improvements": ["string"],
  "next_week_strategy": "string",
  "ai_feedback": "string (personalized motivational feedback)"
}`;

  const userPrompt = `Goal: ${goal.goal_description}
Tasks this week: ${total}
Completed: ${completed}
Completion rate: ${rate.toFixed(0)}%
Task details: ${JSON.stringify(weekTasks?.map((t: any) => ({ text: t.task_text, completed: t.completed, priority: t.priority })))}
Current streak: ${goal.streak_count} days
Overall progress: ${goal.progress_percent}%`;

  const aiResponse = await callAI(apiKey, systemPrompt, userPrompt);
  if (aiResponse.error) {
    return new Response(JSON.stringify({ error: aiResponse.error }), {
      status: aiResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const report = aiResponse.result;

  // Save report
  await supabase.from('autopilot_reports').insert({
    user_id: userId,
    goal_id: goalId,
    week_start: weekStartStr,
    summary: report.summary,
    performance_score: report.performance_score,
    completion_rate: report.completion_rate,
    productivity_insights: { insights: report.insights, improvements: report.improvements },
    ai_feedback: report.ai_feedback,
    next_week_strategy: report.next_week_strategy,
  });

  return new Response(
    JSON.stringify(report),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function analyzeBehavior(supabase: any, userId: string, payload: any, apiKey: string) {
  const { goalId } = payload;

  const { data: goal } = await supabase
    .from('autopilot_goals')
    .select('*')
    .eq('id', goalId)
    .eq('user_id', userId)
    .maybeSingle();

  if (!goal) throw new Error('Goal not found');

  // Check inactivity
  const lastActive = goal.last_active_at ? new Date(goal.last_active_at) : new Date(goal.created_at);
  const daysSinceActive = Math.floor((Date.now() - lastActive.getTime()) / (1000 * 60 * 60 * 24));

  // Get recent completion rates
  const { data: recentLogs } = await supabase
    .from('autopilot_activity_logs')
    .select('*')
    .eq('goal_id', goalId)
    .order('log_date', { ascending: false })
    .limit(7);

  const avgRate = recentLogs && recentLogs.length > 0
    ? recentLogs.reduce((sum: number, l: any) => sum + Number(l.completion_rate), 0) / recentLogs.length
    : 0;

  let retentionTrigger = null;
  if (daysSinceActive >= 7) retentionTrigger = 'inactive_7_days';
  else if (daysSinceActive >= 3) retentionTrigger = 'inactive_3_days';
  else if (avgRate < 40) retentionTrigger = 'low_completion';

  const systemPrompt = `You are a behavioral analyst for a life optimization platform.
Analyze the user's behavior and provide recommendations.
Return JSON:
{
  "behavior_assessment": "string",
  "risk_level": "low|medium|high",
  "recommendations": ["string"],
  "adjustment_needed": boolean,
  "new_difficulty": "easy|medium|hard" or null,
  "motivational_message": "string",
  "retention_action": "string or null"
}`;

  const userPrompt = `Goal: ${goal.goal_description}
Days since last activity: ${daysSinceActive}
Average completion rate (7 days): ${avgRate.toFixed(0)}%
Current difficulty: ${goal.difficulty}
Current streak: ${goal.streak_count}
Retention trigger: ${retentionTrigger || 'none'}
Progress: ${goal.progress_percent}%`;

  const aiResponse = await callAI(apiKey, systemPrompt, userPrompt);
  if (aiResponse.error) {
    return new Response(JSON.stringify({ error: aiResponse.error }), {
      status: aiResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const analysis = aiResponse.result;

  // Create notification if retention trigger
  if (retentionTrigger) {
    await supabase.from('autopilot_notifications').insert({
      user_id: userId,
      goal_id: goalId,
      type: retentionTrigger === 'inactive_7_days' ? 'urgent' : 'reminder',
      title: retentionTrigger === 'inactive_7_days' ? '💪 We miss you!' : '📝 Quick check-in',
      message: analysis.motivational_message,
    });
  }

  // Adjust difficulty if needed
  if (analysis.adjustment_needed && analysis.new_difficulty) {
    await supabase.from('autopilot_goals').update({
      difficulty: analysis.new_difficulty,
    }).eq('id', goalId);
  }

  return new Response(
    JSON.stringify({ ...analysis, retentionTrigger, daysSinceActive }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
