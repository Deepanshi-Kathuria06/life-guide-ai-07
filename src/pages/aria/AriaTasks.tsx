import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Filter, LayoutGrid, List, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AppLayout from "@/components/aria/AppLayout";

type Task = {
  id: string; title: string; description: string | null; due_at: string | null;
  priority: string; category: string; status: string; created_at: string;
};

const categories = ["work", "personal", "health", "finance", "other"];
const priorities = ["low", "medium", "high"];

export default function AriaTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [view, setView] = useState<"list" | "kanban">("kanban");
  const [filterCat, setFilterCat] = useState("all");
  const [filterPri, setFilterPri] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", description: "", due_at: "", priority: "medium", category: "personal" });
  const { toast } = useToast();

  useEffect(() => { loadTasks(); }, []);

  const loadTasks = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("aria_tasks").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    setTasks((data as Task[]) || []);
  };

  const createTask = async () => {
    if (!newTask.title.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("aria_tasks").insert({
      user_id: user.id, title: newTask.title, description: newTask.description || null,
      due_at: newTask.due_at || null, priority: newTask.priority, category: newTask.category,
    });
    setNewTask({ title: "", description: "", due_at: "", priority: "medium", category: "personal" });
    setDialogOpen(false);
    toast({ title: "Task created" });
    loadTasks();
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("aria_tasks").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
    loadTasks();
  };

  const deleteTask = async (id: string) => {
    await supabase.from("aria_tasks").delete().eq("id", id);
    loadTasks();
  };

  const filtered = tasks.filter((t) => {
    if (filterCat !== "all" && t.category !== filterCat) return false;
    if (filterPri !== "all" && t.priority !== filterPri) return false;
    return true;
  });

  const columns = [
    { key: "todo", label: "To Do", color: "border-blue-500/30" },
    { key: "in_progress", label: "In Progress", color: "border-amber-500/30" },
    { key: "done", label: "Done", color: "border-emerald-500/30" },
  ];

  const TaskItem = ({ task }: { task: Task }) => (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group">
      <Checkbox checked={task.status === "done"} onCheckedChange={(c) => updateStatus(task.id, c ? "done" : "todo")} className="mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${task.status === "done" ? "line-through text-muted-foreground" : "text-foreground"}`}>{task.title}</p>
        {task.description && <p className="text-xs text-muted-foreground mt-0.5 truncate">{task.description}</p>}
        <div className="flex gap-2 mt-1.5">
          <span className={`text-xs px-1.5 py-0.5 rounded ${task.priority === "high" ? "bg-destructive/20 text-destructive" : task.priority === "medium" ? "bg-amber-500/20 text-amber-400" : "bg-muted text-muted-foreground"}`}>{task.priority}</span>
          <span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary">{task.category}</span>
          {task.due_at && <span className="text-xs text-muted-foreground">{new Date(task.due_at).toLocaleDateString()}</span>}
        </div>
      </div>
      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 h-7 w-7" onClick={() => deleteTask(task.id)}>
        <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
      </Button>
    </div>
  );

  return (
    <AppLayout>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-foreground">Tasks</h1>
          <div className="flex items-center gap-2">
            <Select value={filterCat} onValueChange={setFilterCat}>
              <SelectTrigger className="w-32 bg-muted border-border"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterPri} onValueChange={setFilterPri}>
              <SelectTrigger className="w-28 bg-muted border-border"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                {priorities.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={() => setView(view === "kanban" ? "list" : "kanban")}>
              {view === "kanban" ? <List className="w-4 h-4" /> : <LayoutGrid className="w-4 h-4" />}
            </Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="w-4 h-4 mr-1" /> New Task</Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border">
                <DialogHeader><DialogTitle>Create Task</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div><Label>Title</Label><Input value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} className="bg-muted border-border" /></div>
                  <div><Label>Description</Label><Textarea value={newTask.description} onChange={(e) => setNewTask({ ...newTask, description: e.target.value })} className="bg-muted border-border" /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>Due Date</Label><Input type="datetime-local" value={newTask.due_at} onChange={(e) => setNewTask({ ...newTask, due_at: e.target.value })} className="bg-muted border-border" /></div>
                    <div><Label>Priority</Label>
                      <Select value={newTask.priority} onValueChange={(v) => setNewTask({ ...newTask, priority: v })}>
                        <SelectTrigger className="bg-muted border-border"><SelectValue /></SelectTrigger>
                        <SelectContent>{priorities.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div><Label>Category</Label>
                    <Select value={newTask.category} onValueChange={(v) => setNewTask({ ...newTask, category: v })}>
                      <SelectTrigger className="bg-muted border-border"><SelectValue /></SelectTrigger>
                      <SelectContent>{categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <Button onClick={createTask} className="w-full">Create Task</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Kanban View */}
        {view === "kanban" ? (
          <div className="grid md:grid-cols-3 gap-4">
            {columns.map((col) => (
              <Card key={col.key} className={`border-t-2 ${col.color} bg-card border-border`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                    {col.label}
                    <span className="bg-muted px-2 py-0.5 rounded-full text-xs">{filtered.filter((t) => t.status === col.key).length}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {filtered.filter((t) => t.status === col.key).map((t) => <TaskItem key={t.id} task={t} />)}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-card border-border">
            <CardContent className="p-4 space-y-2">
              {filtered.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No tasks yet. Create one or ask ARIA!</p>
              ) : filtered.map((t) => <TaskItem key={t.id} task={t} />)}
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
