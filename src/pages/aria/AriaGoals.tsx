import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Plus, Target, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AppLayout from "@/components/aria/AppLayout";

const goalCategories = ["career", "health", "finance", "relationships", "personal growth"];

export default function AriaGoals() {
  const [goals, setGoals] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: "", description: "", category: "personal growth", target_date: "" });
  const { toast } = useToast();

  useEffect(() => { loadGoals(); }, []);

  const loadGoals = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("aria_goals").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    setGoals(data || []);
  };

  const createGoal = async () => {
    if (!newGoal.title.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("aria_goals").insert({
      user_id: user.id, title: newGoal.title, description: newGoal.description || null,
      category: newGoal.category, target_date: newGoal.target_date || null,
    });
    setNewGoal({ title: "", description: "", category: "personal growth", target_date: "" });
    setDialogOpen(false);
    toast({ title: "Goal created" });
    loadGoals();
  };

  const updateProgress = async (id: string, progress: number) => {
    await supabase.from("aria_goals").update({ progress_percent: progress, updated_at: new Date().toISOString() }).eq("id", id);
    setGoals((prev) => prev.map((g) => g.id === id ? { ...g, progress_percent: progress } : g));
  };

  const deleteGoal = async (id: string) => {
    await supabase.from("aria_goals").delete().eq("id", id);
    loadGoals();
  };

  return (
    <AppLayout>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Goals</h1>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="w-4 h-4 mr-1" /> New Goal</Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader><DialogTitle>Create Goal</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>Title</Label><Input value={newGoal.title} onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })} className="bg-muted border-border" /></div>
                <div><Label>Description</Label><Textarea value={newGoal.description} onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })} className="bg-muted border-border" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Category</Label>
                    <Select value={newGoal.category} onValueChange={(v) => setNewGoal({ ...newGoal, category: v })}>
                      <SelectTrigger className="bg-muted border-border"><SelectValue /></SelectTrigger>
                      <SelectContent>{goalCategories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><Label>Target Date</Label><Input type="date" value={newGoal.target_date} onChange={(e) => setNewGoal({ ...newGoal, target_date: e.target.value })} className="bg-muted border-border" /></div>
                </div>
                <Button onClick={createGoal} className="w-full">Create Goal</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {goals.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="py-12 text-center text-muted-foreground">
              <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No goals yet. Set your first life goal!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {goals.map((goal) => (
              <Card key={goal.id} className="bg-card border-border group">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">{goal.title}</h3>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{goal.category}</span>
                      </div>
                      {goal.description && <p className="text-sm text-muted-foreground mb-3">{goal.description}</p>}
                      <div className="flex items-center gap-3">
                        <Progress value={goal.progress_percent} className="flex-1 h-2" />
                        <span className="text-sm font-medium text-foreground w-10">{goal.progress_percent}%</span>
                      </div>
                      <div className="mt-3">
                        <Slider
                          value={[goal.progress_percent]}
                          onValueChange={([v]) => updateProgress(goal.id, v)}
                          max={100} step={5}
                          className="w-full"
                        />
                      </div>
                      {goal.target_date && <p className="text-xs text-muted-foreground mt-2">Target: {new Date(goal.target_date).toLocaleDateString()}</p>}
                    </div>
                    <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100" onClick={() => deleteGoal(goal.id)}>
                      <Trash2 className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
