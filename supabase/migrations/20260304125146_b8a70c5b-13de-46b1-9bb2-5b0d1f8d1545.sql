
-- ARIA User Profiles for onboarding
CREATE TABLE IF NOT EXISTS public.aria_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text,
  goals_summary text,
  work_situation text,
  challenges text,
  communication_style text DEFAULT 'casual',
  aria_context_summary text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Tasks & Reminders
CREATE TABLE IF NOT EXISTS public.aria_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  due_at timestamptz,
  priority text DEFAULT 'medium',
  category text DEFAULT 'personal',
  status text DEFAULT 'todo',
  is_recurring boolean DEFAULT false,
  recurrence_pattern text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Document Vault
CREATE TABLE IF NOT EXISTS public.aria_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  file_url text NOT NULL,
  file_type text,
  file_size bigint,
  category text DEFAULT 'other',
  tags text[] DEFAULT '{}',
  notes text,
  summary text,
  created_at timestamptz DEFAULT now()
);

-- Life Goals
CREATE TABLE IF NOT EXISTS public.aria_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  category text DEFAULT 'personal growth',
  target_date date,
  progress_percent integer DEFAULT 0,
  milestones jsonb DEFAULT '[]',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Quick Notes
CREATE TABLE IF NOT EXISTS public.aria_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text,
  content text DEFAULT '',
  tags text[] DEFAULT '{}',
  is_pinned boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Chat Conversations
CREATE TABLE IF NOT EXISTS public.aria_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text DEFAULT 'New conversation',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Chat Messages
CREATE TABLE IF NOT EXISTS public.aria_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id uuid NOT NULL REFERENCES public.aria_conversations(id) ON DELETE CASCADE,
  role text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Reminders
CREATE TABLE IF NOT EXISTS public.aria_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id uuid REFERENCES public.aria_tasks(id) ON DELETE SET NULL,
  title text NOT NULL,
  remind_at timestamptz NOT NULL,
  is_sent boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.aria_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aria_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aria_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aria_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aria_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aria_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aria_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aria_reminders ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users manage own aria profile" ON public.aria_profiles FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own aria tasks" ON public.aria_tasks FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own aria documents" ON public.aria_documents FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own aria goals" ON public.aria_goals FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own aria notes" ON public.aria_notes FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own aria conversations" ON public.aria_conversations FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own aria messages" ON public.aria_messages FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own aria reminders" ON public.aria_reminders FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Storage bucket for documents
INSERT INTO storage.buckets (id, name, public, file_size_limit) VALUES ('aria-documents', 'aria-documents', false, 26214400);

-- Storage RLS policies
CREATE POLICY "Users upload own aria docs" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'aria-documents' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users view own aria docs" ON storage.objects FOR SELECT USING (bucket_id = 'aria-documents' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users delete own aria docs" ON storage.objects FOR DELETE USING (bucket_id = 'aria-documents' AND (storage.foldername(name))[1] = auth.uid()::text);
