import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, Calendar, Target } from "lucide-react";

interface ProgressTrackerProps {
  chatId: string | null;
  coachType: string;
}

interface ProgressData {
  totalSessions: number;
  currentStreak: number;
  goalsAchieved: number;
  lastSessionDate: string | null;
}

export default function ProgressTracker({ chatId, coachType }: ProgressTrackerProps) {
  const [progress, setProgress] = useState<ProgressData>({
    totalSessions: 0,
    currentStreak: 0,
    goalsAchieved: 0,
    lastSessionDate: null,
  });

  useEffect(() => {
    if (chatId) loadProgress();

    // Real-time updates
    const channel = supabase
      .channel('progress-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`
        },
        () => {
          loadProgress();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId]);

  const loadProgress = async () => {
    if (!chatId) return;

    // Count messages from this chat
    const { data: messages } = await supabase
      .from("messages")
      .select("created_at")
      .eq("chat_id", chatId)
      .eq("role", "user")
      .order("created_at", { ascending: false });

    if (messages && messages.length > 0) {
      setProgress({
        totalSessions: messages.length,
        currentStreak: calculateStreak(messages),
        goalsAchieved: Math.floor(messages.length / 5), // Simple achievement metric
        lastSessionDate: messages[0].created_at,
      });
    }
  };

  const calculateStreak = (messages: any[]) => {
    if (messages.length === 0) return 0;
    
    let streak = 1;
    const dates = messages.map(m => new Date(m.created_at).toDateString());
    const uniqueDates = [...new Set(dates)];
    
    for (let i = 0; i < uniqueDates.length - 1; i++) {
      const current = new Date(uniqueDates[i]);
      const next = new Date(uniqueDates[i + 1]);
      const diffDays = Math.abs(current.getTime() - next.getTime()) / (1000 * 60 * 60 * 24);
      
      if (diffDays <= 1) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const stats = [
    { icon: Calendar, label: "Sessions", value: progress.totalSessions, color: "text-blue-400" },
    { icon: TrendingUp, label: "Day Streak", value: progress.currentStreak, color: "text-green-400" },
    { icon: Target, label: "Milestones", value: progress.goalsAchieved, color: "text-purple-400" },
  ];

  return (
    <Card className="p-6 bg-card/50 backdrop-blur-sm border-primary/20">
      <h3 className="text-lg font-semibold mb-4">Your Progress</h3>
      <div className="grid grid-cols-3 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="text-center">
            <stat.icon className={`h-6 w-6 mx-auto mb-2 ${stat.color}`} />
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}
