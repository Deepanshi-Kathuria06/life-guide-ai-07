
-- Autopilot goals table
CREATE TABLE public.autopilot_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  goal_description TEXT NOT NULL,
  deadline DATE,
  daily_time_minutes INTEGER NOT NULL DEFAULT 30,
  difficulty TEXT NOT NULL DEFAULT 'medium',
  challenges TEXT,
  motivation_type TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  autopilot_enabled BOOLEAN NOT NULL DEFAULT true,
  milestones JSONB DEFAULT '[]'::jsonb,
  progress_percent INTEGER NOT NULL DEFAULT 0,
  streak_count INTEGER NOT NULL DEFAULT 0,
  last_active_at TIMESTAMP WITH TIME ZONE,
  ai_plan JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.autopilot_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own autopilot goals" ON public.autopilot_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own autopilot goals" ON public.autopilot_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own autopilot goals" ON public.autopilot_goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own autopilot goals" ON public.autopilot_goals FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_autopilot_goals_updated_at
  BEFORE UPDATE ON public.autopilot_goals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Autopilot daily tasks table
CREATE TABLE public.autopilot_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_id UUID NOT NULL REFERENCES public.autopilot_goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  task_text TEXT NOT NULL,
  due_date DATE NOT NULL DEFAULT CURRENT_DATE,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  adjustment_flag BOOLEAN NOT NULL DEFAULT false,
  adjustment_reason TEXT,
  priority TEXT NOT NULL DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.autopilot_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own autopilot tasks" ON public.autopilot_tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own autopilot tasks" ON public.autopilot_tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own autopilot tasks" ON public.autopilot_tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own autopilot tasks" ON public.autopilot_tasks FOR DELETE USING (auth.uid() = user_id);

-- Activity logs table
CREATE TABLE public.autopilot_activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  goal_id UUID NOT NULL REFERENCES public.autopilot_goals(id) ON DELETE CASCADE,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  completion_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  tasks_completed INTEGER NOT NULL DEFAULT 0,
  tasks_total INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.autopilot_activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own activity logs" ON public.autopilot_activity_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own activity logs" ON public.autopilot_activity_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Weekly reports table
CREATE TABLE public.autopilot_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  goal_id UUID NOT NULL REFERENCES public.autopilot_goals(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  summary TEXT NOT NULL,
  performance_score INTEGER NOT NULL DEFAULT 0,
  completion_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  productivity_insights JSONB,
  ai_feedback TEXT,
  next_week_strategy TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.autopilot_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reports" ON public.autopilot_reports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own reports" ON public.autopilot_reports FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Notifications table
CREATE TABLE public.autopilot_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  goal_id UUID REFERENCES public.autopilot_goals(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'reminder',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.autopilot_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications" ON public.autopilot_notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own notifications" ON public.autopilot_notifications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own notifications" ON public.autopilot_notifications FOR UPDATE USING (auth.uid() = user_id);
