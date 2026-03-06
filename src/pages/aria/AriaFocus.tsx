import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import AppLayout from "@/components/aria/AppLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Play, Pause, RotateCcw, Timer, Coffee, Zap } from "lucide-react";

const PRESETS = [
  { label: "Pomodoro", work: 25, break: 5 },
  { label: "Deep Work", work: 50, break: 10 },
  { label: "Quick Sprint", work: 15, break: 3 },
];

export default function AriaFocus() {
  const [preset, setPreset] = useState(PRESETS[0]);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) { setUserId(user.id); loadStats(user.id); }
    });
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const loadStats = async (uid: string) => {
    const { data } = await supabase.from("aria_focus_sessions").select("duration_minutes").eq("user_id", uid).eq("completed", true);
    if (data) {
      setSessionsCompleted(data.length);
      setTotalMinutes(data.reduce((s, r) => s + (r as any).duration_minutes, 0));
    }
  };

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0) {
      handleComplete();
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, timeLeft]);

  const handleComplete = async () => {
    setIsRunning(false);
    if (!isBreak && userId) {
      await supabase.from("aria_focus_sessions").insert({
        user_id: userId, duration_minutes: preset.work, completed: true, ended_at: new Date().toISOString(),
      });
      await supabase.from("aria_xp_logs").insert({
        user_id: userId, xp_amount: 15, source: "focus_session", description: `Completed ${preset.work}min focus session`,
      });
      setSessionsCompleted(s => s + 1);
      setTotalMinutes(t => t + preset.work);
      toast({ title: "+15 XP! Focus session complete 🎯", description: "Time for a break!" });
      setIsBreak(true);
      setTimeLeft(preset.break * 60);
    } else {
      toast({ title: "Break over!", description: "Ready for another session?" });
      setIsBreak(false);
      setTimeLeft(preset.work * 60);
    }
  };

  const toggleTimer = () => setIsRunning(!isRunning);
  const resetTimer = () => {
    setIsRunning(false);
    setIsBreak(false);
    setTimeLeft(preset.work * 60);
  };

  const selectPreset = (p: typeof PRESETS[0]) => {
    setPreset(p);
    setIsRunning(false);
    setIsBreak(false);
    setTimeLeft(p.work * 60);
  };

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const progress = isBreak
    ? ((preset.break * 60 - timeLeft) / (preset.break * 60)) * 100
    : ((preset.work * 60 - timeLeft) / (preset.work * 60)) * 100;

  return (
    <AppLayout>
      <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-4 text-center">
            <Timer className="w-5 h-5 mx-auto text-muted-foreground mb-1" />
            <p className="text-2xl font-bold text-foreground">{sessionsCompleted}</p>
            <p className="text-xs text-muted-foreground">Sessions</p>
          </Card>
          <Card className="p-4 text-center">
            <Zap className="w-5 h-5 mx-auto text-primary mb-1" />
            <p className="text-2xl font-bold text-foreground">{Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m</p>
            <p className="text-xs text-muted-foreground">Total Focus</p>
          </Card>
          <Card className="p-4 text-center">
            <Coffee className="w-5 h-5 mx-auto text-muted-foreground mb-1" />
            <p className="text-2xl font-bold text-foreground">{sessionsCompleted * 15}</p>
            <p className="text-xs text-muted-foreground">XP Earned</p>
          </Card>
        </div>

        {/* Presets */}
        <div className="flex gap-2 justify-center">
          {PRESETS.map(p => (
            <Button key={p.label} variant={preset.label === p.label ? "default" : "outline"} size="sm"
              onClick={() => selectPreset(p)}>{p.label} ({p.work}m)</Button>
          ))}
        </div>

        {/* Timer */}
        <Card className="p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
          <div className="relative">
            <p className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wider">
              {isBreak ? "☕ Break Time" : "🎯 Focus Mode"}
            </p>
            <div className="relative w-48 h-48 mx-auto mb-6">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" strokeWidth="3" className="stroke-muted" />
                <circle cx="50" cy="50" r="45" fill="none" strokeWidth="3" className="stroke-primary"
                  strokeDasharray={`${2 * Math.PI * 45}`}
                  strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                  strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-5xl font-mono font-bold text-foreground">
                  {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
                </span>
              </div>
            </div>
            <div className="flex gap-3 justify-center">
              <Button size="lg" onClick={toggleTimer} className="w-32">
                {isRunning ? <><Pause className="w-5 h-5 mr-2" /> Pause</> : <><Play className="w-5 h-5 mr-2" /> {progress > 0 ? "Resume" : "Start"}</>}
              </Button>
              <Button size="lg" variant="outline" onClick={resetTimer}><RotateCcw className="w-5 h-5" /></Button>
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
