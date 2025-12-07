import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Target, Plus, CheckCircle2, Circle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Goal {
  id: string;
  title: string;
  completed: boolean;
  created_at: string;
}

interface GoalsManagerProps {
  coachType: string;
  chatId: string | null;
}

export default function GoalsManager({ coachType, chatId }: GoalsManagerProps) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoal, setNewGoal] = useState("");
  const [loading, setLoading] = useState(false);
  const [addingGoal, setAddingGoal] = useState(false);

  useEffect(() => {
    if (chatId) {
      loadGoals();
    }
  }, [coachType, chatId]);

  const loadGoals = async () => {
    if (!chatId) return;
    
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("habits")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Filter goals by coach type - stored with coach prefix
      const goalsData = data
        ?.filter(habit => habit.habit_name.startsWith(`[${coachType}]`))
        .map(habit => ({
          id: habit.id,
          title: habit.habit_name.replace(`[${coachType}]`, '').trim(),
          completed: habit.last_completed_at !== null,
          created_at: habit.created_at || new Date().toISOString(),
        })) || [];

      setGoals(goalsData);
    } catch (error: any) {
      console.error("Error loading goals:", error);
    } finally {
      setLoading(false);
    }
  };

  const addGoal = async () => {
    if (!newGoal.trim() || !chatId) return;

    setAddingGoal(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Prefix with coach type to keep goals separate per coach
      const { error } = await supabase
        .from("habits")
        .insert({
          user_id: user.id,
          habit_name: `[${coachType}] ${newGoal.trim()}`,
          is_active: true,
        });

      if (error) throw error;

      toast({
        title: "Goal added!",
        description: "Your new goal has been added successfully.",
      });

      setNewGoal("");
      loadGoals();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add goal",
        variant: "destructive",
      });
    } finally {
      setAddingGoal(false);
    }
  };

  const toggleGoal = async (goalId: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from("habits")
        .update({
          last_completed_at: completed ? null : new Date().toISOString(),
        })
        .eq("id", goalId);

      if (error) throw error;

      loadGoals();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update goal",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="p-4 sm:p-6 bg-card/50 backdrop-blur-sm border-primary/20">
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <Target className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
        <h3 className="text-base sm:text-lg font-semibold">Goals & Targets</h3>
      </div>

      <div className="flex gap-2 mb-3 sm:mb-4">
        <Input
          value={newGoal}
          onChange={(e) => setNewGoal(e.target.value)}
          placeholder="Add a new goal..."
          onKeyPress={(e) => e.key === "Enter" && addGoal()}
          disabled={addingGoal}
          className="text-sm sm:text-base"
          autoFocus={false}
          autoComplete="off"
        />
        <Button onClick={addGoal} disabled={addingGoal || !newGoal.trim()} size="icon" className="flex-shrink-0">
          {addingGoal ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-6 sm:py-8">
          <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin text-primary" />
        </div>
      ) : goals.length > 0 ? (
        <div className="space-y-2 max-h-[200px] sm:max-h-[300px] overflow-y-auto">
          {goals.map((goal) => (
            <div
              key={goal.id}
              className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-background/50 hover:bg-background/70 transition-colors cursor-pointer"
              onClick={() => toggleGoal(goal.id, goal.completed)}
            >
              {goal.completed ? (
                <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-400 flex-shrink-0" />
              ) : (
                <Circle className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
              )}
              <span className={`text-sm sm:text-base ${goal.completed ? "line-through text-muted-foreground" : ""}`}>
                {goal.title}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-xs sm:text-sm text-center py-6 sm:py-8">
          No goals yet. Add your first goal above!
        </p>
      )}
    </Card>
  );
}
