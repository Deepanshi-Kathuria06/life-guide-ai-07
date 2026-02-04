import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, Plus, CheckCircle2, Circle, Loader2, 
  Clock, Trash2, ArrowUp, ArrowRight, ArrowDown,
  AlertTriangle, Calendar
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  due_date: string | null;
  ai_generated: boolean;
  ai_feedback: string | null;
  created_at: string;
}

interface CoachTasksPanelProps {
  coachType: string;
  chatId: string | null;
}

const priorityConfig = {
  urgent: { icon: AlertTriangle, color: "text-red-500", bg: "bg-red-500/10", label: "Urgent" },
  high: { icon: ArrowUp, color: "text-orange-500", bg: "bg-orange-500/10", label: "High" },
  medium: { icon: ArrowRight, color: "text-yellow-500", bg: "bg-yellow-500/10", label: "Medium" },
  low: { icon: ArrowDown, color: "text-green-500", bg: "bg-green-500/10", label: "Low" },
};

export default function CoachTasksPanel({ coachType, chatId }: CoachTasksPanelProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [addingTask, setAddingTask] = useState(false);

  const loadTasks = useCallback(async () => {
    if (!chatId) return;
    
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("coach_tasks")
        .select("*")
        .eq("user_id", user.id)
        .eq("coach_type", coachType)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTasks((data as Task[]) || []);
    } catch (error: any) {
      console.error("Error loading tasks:", error);
    } finally {
      setLoading(false);
    }
  }, [coachType, chatId]);

  useEffect(() => {
    if (chatId) {
      loadTasks();
    }
  }, [chatId, loadTasks]);

  const extractTasksFromChat = async () => {
    if (!chatId) return;

    setExtracting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const response = await supabase.functions.invoke('extract-tasks', {
        body: { chatId, coachType }
      });

      if (response.error) throw response.error;

      const extractedTasks = response.data?.tasks || [];
      
      if (extractedTasks.length === 0) {
        toast({
          title: "No tasks found",
          description: "Continue chatting to generate actionable tasks!",
        });
        return;
      }

      // Save extracted tasks
      const tasksToInsert = extractedTasks.map((task: any) => ({
        user_id: user.id,
        coach_type: coachType,
        chat_id: chatId,
        title: task.title,
        description: task.description,
        priority: task.priority || 'medium',
        ai_generated: true,
        due_date: task.timeframe === 'today' 
          ? new Date().toISOString()
          : task.timeframe === 'this_week'
          ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
          : null,
      }));

      const { error } = await supabase
        .from("coach_tasks")
        .insert(tasksToInsert);

      if (error) throw error;

      toast({
        title: "Tasks extracted!",
        description: `${extractedTasks.length} tasks added from your conversation.`,
      });

      loadTasks();
    } catch (error: any) {
      console.error("Error extracting tasks:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to extract tasks",
        variant: "destructive",
      });
    } finally {
      setExtracting(false);
    }
  };

  const addTask = async () => {
    if (!newTaskTitle.trim() || !chatId) return;

    setAddingTask(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("coach_tasks")
        .insert({
          user_id: user.id,
          coach_type: coachType,
          chat_id: chatId,
          title: newTaskTitle.trim(),
          priority: 'medium',
          ai_generated: false,
        });

      if (error) throw error;

      toast({
        title: "Task added!",
        description: "Your new task has been added.",
      });

      setNewTaskTitle("");
      loadTasks();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add task",
        variant: "destructive",
      });
    } finally {
      setAddingTask(false);
    }
  };

  const toggleTaskStatus = async (taskId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
      
      const { error } = await supabase
        .from("coach_tasks")
        .update({
          status: newStatus,
          completed_at: newStatus === 'completed' ? new Date().toISOString() : null,
        })
        .eq("id", taskId);

      if (error) throw error;
      loadTasks();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update task",
        variant: "destructive",
      });
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from("coach_tasks")
        .delete()
        .eq("id", taskId);

      if (error) throw error;
      loadTasks();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete task",
        variant: "destructive",
      });
    }
  };

  const pendingTasks = tasks.filter(t => t.status !== 'completed');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  return (
    <Card className="p-4 sm:p-6 bg-card/50 backdrop-blur-sm border-primary/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Smart Tasks</h3>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={extractTasksFromChat}
          disabled={extracting || !chatId}
          className="gap-2"
        >
          {extracting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          AI Extract
        </Button>
      </div>

      {/* Add task input */}
      <div className="flex gap-2 mb-4">
        <Input
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="Add a task..."
          onKeyPress={(e) => e.key === "Enter" && addTask()}
          disabled={addingTask}
          className="text-sm"
          autoComplete="off"
        />
        <Button onClick={addTask} disabled={addingTask || !newTaskTitle.trim()} size="icon" className="flex-shrink-0">
          {addingTask ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-4 max-h-[400px] overflow-y-auto">
          {/* Pending tasks */}
          {pendingTasks.length > 0 && (
            <div className="space-y-2">
              {pendingTasks.map((task) => {
                const priorityInfo = priorityConfig[task.priority];
                const PriorityIcon = priorityInfo.icon;
                
                return (
                  <div
                    key={task.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-background/50 hover:bg-background/70 transition-colors group"
                  >
                    <button
                      onClick={() => toggleTaskStatus(task.id, task.status)}
                      className="mt-0.5 flex-shrink-0"
                    >
                      <Circle className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm truncate">{task.title}</span>
                        {task.ai_generated && (
                          <Badge variant="secondary" className="text-xs gap-1">
                            <Sparkles className="h-3 w-3" />
                            AI
                          </Badge>
                        )}
                      </div>
                      {task.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={`${priorityInfo.bg} ${priorityInfo.color} text-xs`}>
                          <PriorityIcon className="h-3 w-3 mr-1" />
                          {priorityInfo.label}
                        </Badge>
                        {task.due_date && (
                          <Badge variant="outline" className="text-xs gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(task.due_date).toLocaleDateString()}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Completed tasks */}
          {completedTasks.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                Completed ({completedTasks.length})
              </p>
              {completedTasks.slice(0, 3).map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-2 rounded-lg bg-background/30 group"
                >
                  <button
                    onClick={() => toggleTaskStatus(task.id, task.status)}
                    className="flex-shrink-0"
                  >
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  </button>
                  <span className="text-sm text-muted-foreground line-through truncate flex-1">
                    {task.title}
                  </span>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {tasks.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No tasks yet</p>
              <p className="text-xs mt-1">Chat with your coach then click "AI Extract"!</p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
