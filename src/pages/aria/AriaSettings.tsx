import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import AppLayout from "@/components/aria/AppLayout";

export default function AriaSettings() {
  const [profile, setProfile] = useState<any>(null);
  const [form, setForm] = useState({ name: "", communication_style: "casual", goals_summary: "", work_situation: "", challenges: "" });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("aria_profiles").select("*").eq("user_id", user.id).single();
    if (data) {
      setProfile(data);
      setForm({
        name: data.name || "",
        communication_style: data.communication_style || "casual",
        goals_summary: data.goals_summary || "",
        work_situation: data.work_situation || "",
        challenges: data.challenges || "",
      });
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      await supabase.from("aria_profiles").update({
        ...form, updated_at: new Date().toISOString(),
      }).eq("id", profile.id);
      toast({ title: "Settings saved" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const exportData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const [tasks, notes, goals, docs] = await Promise.all([
      supabase.from("aria_tasks").select("*").eq("user_id", user.id),
      supabase.from("aria_notes").select("*").eq("user_id", user.id),
      supabase.from("aria_goals").select("*").eq("user_id", user.id),
      supabase.from("aria_documents").select("id, title, category, notes, created_at").eq("user_id", user.id),
    ]);
    const exportObj = { tasks: tasks.data, notes: notes.data, goals: goals.data, documents: docs.data, exported_at: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "aria-export.json"; a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Data exported" });
  };

  return (
    <AppLayout>
      <div className="p-6 max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>

        <Card className="bg-card border-border">
          <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-muted border-border" /></div>
            <div><Label>ARIA Communication Style</Label>
              <Select value={form.communication_style} onValueChange={(v) => setForm({ ...form, communication_style: v })}>
                <SelectTrigger className="bg-muted border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="casual">Casual & Friendly</SelectItem>
                  <SelectItem value="formal">Formal & Professional</SelectItem>
                  <SelectItem value="coach">Coach-like & Motivating</SelectItem>
                  <SelectItem value="secretary">Secretary-like & Efficient</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Life Goals Summary</Label><Input value={form.goals_summary} onChange={(e) => setForm({ ...form, goals_summary: e.target.value })} className="bg-muted border-border" /></div>
            <div><Label>Work Situation</Label><Input value={form.work_situation} onChange={(e) => setForm({ ...form, work_situation: e.target.value })} className="bg-muted border-border" /></div>
            <div><Label>Current Challenges</Label><Input value={form.challenges} onChange={(e) => setForm({ ...form, challenges: e.target.value })} className="bg-muted border-border" /></div>
            <Button onClick={save} disabled={saving} className="w-full">{saving ? "Saving..." : "Save Changes"}</Button>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader><CardTitle>Data</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" onClick={exportData} className="w-full">Export All Data (JSON)</Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
