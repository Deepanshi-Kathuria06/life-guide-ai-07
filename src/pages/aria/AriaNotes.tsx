import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Pin, PinOff, Trash2, Search, Sparkles, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AppLayout from "@/components/aria/AppLayout";

export default function AriaNotes() {
  const [notes, setNotes] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedNote, setSelectedNote] = useState<any>(null);
  const [editing, setEditing] = useState({ title: "", content: "" });
  const [expanding, setExpanding] = useState(false);
  const { toast } = useToast();

  useEffect(() => { loadNotes(); }, []);

  const loadNotes = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("aria_notes").select("*").eq("user_id", user.id).order("is_pinned", { ascending: false }).order("updated_at", { ascending: false });
    setNotes(data || []);
  };

  const createNote = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("aria_notes").insert({ user_id: user.id, title: "Untitled Note" }).select().single();
    if (data) { setSelectedNote(data); setEditing({ title: data.title || "", content: "" }); }
    loadNotes();
  };

  const saveNote = async () => {
    if (!selectedNote) return;
    await supabase.from("aria_notes").update({ title: editing.title, content: editing.content, updated_at: new Date().toISOString() }).eq("id", selectedNote.id);
    loadNotes();
    toast({ title: "Note saved" });
  };

  const togglePin = async (id: string, pinned: boolean) => {
    await supabase.from("aria_notes").update({ is_pinned: !pinned }).eq("id", id);
    loadNotes();
  };

  const deleteNote = async (id: string) => {
    await supabase.from("aria_notes").delete().eq("id", id);
    if (selectedNote?.id === id) setSelectedNote(null);
    loadNotes();
  };

  const expandWithAria = async () => {
    if (!editing.content.trim()) return;
    setExpanding(true);
    try {
      const { data, error } = await supabase.functions.invoke("aria-summarize", {
        body: { text: editing.content, type: "expand" },
      });
      if (error) throw error;
      setEditing({ ...editing, content: data.summary });
      toast({ title: "Note expanded by ARIA" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setExpanding(false);
    }
  };

  const filtered = notes.filter((n) =>
    (n.title || "").toLowerCase().includes(search.toLowerCase()) ||
    (n.content || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-foreground">Notes</h1>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-muted border-border w-48" />
            </div>
            <Button onClick={createNote}><Plus className="w-4 h-4 mr-1" /> New Note</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((note) => (
            <Card
              key={note.id}
              className="bg-card border-border hover:border-primary/30 transition-colors cursor-pointer group"
              onClick={() => { setSelectedNote(note); setEditing({ title: note.title || "", content: note.content || "" }); }}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      {note.is_pinned && <Pin className="w-3 h-3 text-primary shrink-0" />}
                      <p className="font-medium text-foreground truncate">{note.title || "Untitled"}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-3">{note.content || "Empty note"}</p>
                    <p className="text-xs text-muted-foreground mt-2">{new Date(note.updated_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); togglePin(note.id, note.is_pinned); }}>
                      {note.is_pinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }}>
                      <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Note Editor Dialog */}
        <Dialog open={!!selectedNote} onOpenChange={(o) => { if (!o) { saveNote(); setSelectedNote(null); } }}>
          <DialogContent className="bg-card border-border max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader><DialogTitle className="sr-only">Edit Note</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input
                value={editing.title}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                className="bg-transparent border-none text-lg font-bold p-0 focus-visible:ring-0"
                placeholder="Note title..."
              />
              <Textarea
                value={editing.content}
                onChange={(e) => setEditing({ ...editing, content: e.target.value })}
                className="bg-muted border-border min-h-[300px] resize-none"
                placeholder="Start writing..."
              />
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={expandWithAria} disabled={expanding}>
                  {expanding ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Sparkles className="w-4 h-4 mr-1" />}
                  Expand with ARIA
                </Button>
                <Button size="sm" onClick={saveNote}>Save</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
