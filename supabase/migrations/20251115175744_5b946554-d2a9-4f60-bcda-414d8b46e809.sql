-- Life Snapshots table
CREATE TABLE IF NOT EXISTS public.life_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_1 TEXT NOT NULL,
  question_2 TEXT NOT NULL,
  question_3 TEXT NOT NULL,
  life_score INTEGER NOT NULL,
  priority TEXT NOT NULL,
  ai_analysis TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Rituals table
CREATE TABLE IF NOT EXISTS public.rituals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ritual_type TEXT NOT NULL CHECK (ritual_type IN ('morning', 'evening', 'work')),
  title TEXT NOT NULL,
  steps JSONB NOT NULL,
  duration INTEGER NOT NULL,
  reminders JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Mood entries table
CREATE TABLE IF NOT EXISTS public.mood_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mood_text TEXT NOT NULL,
  detected_mood TEXT NOT NULL,
  mood_score INTEGER NOT NULL CHECK (mood_score >= 1 AND mood_score <= 10),
  emotions JSONB NOT NULL,
  suggestions JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Life timelines table
CREATE TABLE IF NOT EXISTS public.life_timelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal TEXT NOT NULL,
  milestones JSONB NOT NULL,
  duration_months INTEGER NOT NULL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Voice wisdom table
CREATE TABLE IF NOT EXISTS public.voice_wisdom (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transcription TEXT NOT NULL,
  summary TEXT NOT NULL,
  emotion_score INTEGER NOT NULL,
  suggestions JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Weekly plans table
CREATE TABLE IF NOT EXISTS public.weekly_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  plan_details JSONB NOT NULL,
  ai_insights TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Habits table
CREATE TABLE IF NOT EXISTS public.habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  habit_name TEXT NOT NULL,
  streak_count INTEGER DEFAULT 0,
  last_completed_at TIMESTAMPTZ,
  reminder_time TIME,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Journal entries table
CREATE TABLE IF NOT EXISTS public.journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  themes JSONB,
  patterns JSONB,
  improvements JSONB,
  positivity_index INTEGER,
  ai_analysis TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.life_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rituals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.life_timelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_wisdom ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for life_snapshots
CREATE POLICY "Users can view their own life snapshots"
  ON public.life_snapshots FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own life snapshots"
  ON public.life_snapshots FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for rituals
CREATE POLICY "Users can view their own rituals"
  ON public.rituals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own rituals"
  ON public.rituals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own rituals"
  ON public.rituals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own rituals"
  ON public.rituals FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for mood_entries
CREATE POLICY "Users can view their own mood entries"
  ON public.mood_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own mood entries"
  ON public.mood_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for life_timelines
CREATE POLICY "Users can view their own timelines"
  ON public.life_timelines FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own timelines"
  ON public.life_timelines FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own timelines"
  ON public.life_timelines FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for voice_wisdom
CREATE POLICY "Users can view their own voice wisdom"
  ON public.voice_wisdom FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own voice wisdom"
  ON public.voice_wisdom FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for weekly_plans
CREATE POLICY "Users can view their own weekly plans"
  ON public.weekly_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own weekly plans"
  ON public.weekly_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for habits
CREATE POLICY "Users can view their own habits"
  ON public.habits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own habits"
  ON public.habits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own habits"
  ON public.habits FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own habits"
  ON public.habits FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for journal_entries
CREATE POLICY "Users can view their own journal entries"
  ON public.journal_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own journal entries"
  ON public.journal_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_rituals_updated_at
  BEFORE UPDATE ON public.rituals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_life_timelines_updated_at
  BEFORE UPDATE ON public.life_timelines
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_habits_updated_at
  BEFORE UPDATE ON public.habits
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();