
-- Habits tracker with streaks and gamification
CREATE TABLE public.aria_habits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  icon text DEFAULT '⭐',
  frequency text DEFAULT 'daily',
  target_count integer DEFAULT 1,
  current_streak integer DEFAULT 0,
  best_streak integer DEFAULT 0,
  total_completions integer DEFAULT 0,
  last_completed_at timestamp with time zone,
  is_active boolean DEFAULT true,
  category text DEFAULT 'personal',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
ALTER TABLE public.aria_habits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own habits" ON public.aria_habits FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Habit completions log
CREATE TABLE public.aria_habit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  habit_id uuid NOT NULL REFERENCES public.aria_habits(id) ON DELETE CASCADE,
  completed_at timestamp with time zone DEFAULT now(),
  notes text
);
ALTER TABLE public.aria_habit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own habit logs" ON public.aria_habit_logs FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- XP and gamification
CREATE TABLE public.aria_xp_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  xp_amount integer NOT NULL,
  source text NOT NULL,
  source_id uuid,
  description text,
  created_at timestamp with time zone DEFAULT now()
);
ALTER TABLE public.aria_xp_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own xp" ON public.aria_xp_logs FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Mood tracker
CREATE TABLE public.aria_mood_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  mood_score integer NOT NULL CHECK (mood_score >= 1 AND mood_score <= 10),
  mood_label text NOT NULL,
  energy_level integer CHECK (energy_level >= 1 AND energy_level <= 5),
  journal_entry text,
  tags text[] DEFAULT '{}',
  ai_insight text,
  created_at timestamp with time zone DEFAULT now()
);
ALTER TABLE public.aria_mood_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own mood" ON public.aria_mood_entries FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Finance tracker
CREATE TABLE public.aria_expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  amount numeric(12,2) NOT NULL,
  type text NOT NULL DEFAULT 'expense',
  category text DEFAULT 'other',
  description text,
  date date DEFAULT CURRENT_DATE,
  is_recurring boolean DEFAULT false,
  recurrence_pattern text,
  created_at timestamp with time zone DEFAULT now()
);
ALTER TABLE public.aria_expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own expenses" ON public.aria_expenses FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Budget goals
CREATE TABLE public.aria_budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  category text NOT NULL,
  monthly_limit numeric(12,2) NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);
ALTER TABLE public.aria_budgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own budgets" ON public.aria_budgets FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Focus/Pomodoro sessions
CREATE TABLE public.aria_focus_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  duration_minutes integer NOT NULL,
  task_id uuid REFERENCES public.aria_tasks(id) ON DELETE SET NULL,
  completed boolean DEFAULT false,
  notes text,
  started_at timestamp with time zone DEFAULT now(),
  ended_at timestamp with time zone
);
ALTER TABLE public.aria_focus_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own focus sessions" ON public.aria_focus_sessions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Bookmarks / Link saver
CREATE TABLE public.aria_bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  url text NOT NULL,
  title text,
  description text,
  tags text[] DEFAULT '{}',
  category text DEFAULT 'general',
  is_favorite boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);
ALTER TABLE public.aria_bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own bookmarks" ON public.aria_bookmarks FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Weekly reviews
CREATE TABLE public.aria_weekly_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  week_start date NOT NULL,
  tasks_completed integer DEFAULT 0,
  tasks_total integer DEFAULT 0,
  goals_progress jsonb DEFAULT '[]',
  mood_average numeric(3,1),
  xp_earned integer DEFAULT 0,
  highlights text,
  challenges text,
  ai_summary text,
  ai_recommendations text,
  created_at timestamp with time zone DEFAULT now()
);
ALTER TABLE public.aria_weekly_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own reviews" ON public.aria_weekly_reviews FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Add XP fields to aria_profiles
ALTER TABLE public.aria_profiles ADD COLUMN IF NOT EXISTS total_xp integer DEFAULT 0;
ALTER TABLE public.aria_profiles ADD COLUMN IF NOT EXISTS level integer DEFAULT 1;
ALTER TABLE public.aria_profiles ADD COLUMN IF NOT EXISTS badges jsonb DEFAULT '[]';
ALTER TABLE public.aria_profiles ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE public.aria_profiles ADD COLUMN IF NOT EXISTS notification_preferences jsonb DEFAULT '{"morning_briefing": true, "weekly_review": true, "task_reminders": true, "habit_reminders": true}';
