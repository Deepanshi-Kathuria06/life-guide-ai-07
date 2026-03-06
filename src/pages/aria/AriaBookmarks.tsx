import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import AppLayout from "@/components/aria/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, ExternalLink, Star, Trash2, Bookmark, Search } from "lucide-react";

const CATEGORIES = ["general", "work", "learning", "reference", "inspiration", "tools", "news"];

type BookmarkItem = {
  id: string;
  url: string;
  title: string | null;
  description: string | null;
  tags: string[];
  category: string;
  is_favorite: boolean;
  created_at: string;
};

export default function AriaBookmarks() {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newCategory, setNewCategory] = useState("general");
  const [search, setSearch] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) { setUserId(user.id); loadBookmarks(user.id); }
    });
  }, []);

  const loadBookmarks = async (uid: string) => {
    const { data } = await supabase.from("aria_bookmarks").select("*").eq("user_id", uid).order("created_at", { ascending: false });
    if (data) setBookmarks(data as BookmarkItem[]);
  };

  const addBookmark = async () => {
    if (!newUrl.trim() || !userId) return;
    await supabase.from("aria_bookmarks").insert({
      user_id: userId, url: newUrl.trim(), title: newTitle || null,
      description: newDescription || null, category: newCategory,
    });
    setNewUrl(""); setNewTitle(""); setNewDescription(""); setDialogOpen(false);
    loadBookmarks(userId);
    toast({ title: "Bookmark saved! 🔖" });
  };

  const toggleFavorite = async (b: BookmarkItem) => {
    await supabase.from("aria_bookmarks").update({ is_favorite: !b.is_favorite }).eq("id", b.id);
    if (userId) loadBookmarks(userId);
  };

  const deleteBookmark = async (id: string) => {
    await supabase.from("aria_bookmarks").delete().eq("id", id);
    if (userId) loadBookmarks(userId);
  };

  const filtered = bookmarks.filter(b =>
    !search || b.title?.toLowerCase().includes(search.toLowerCase()) || b.url.toLowerCase().includes(search.toLowerCase()) || b.category.includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Bookmarks</h1>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" /> Save Link</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Save Bookmark</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <Input placeholder="URL" value={newUrl} onChange={e => setNewUrl(e.target.value)} />
                <Input placeholder="Title (optional)" value={newTitle} onChange={e => setNewTitle(e.target.value)} />
                <Input placeholder="Description (optional)" value={newDescription} onChange={e => setNewDescription(e.target.value)} />
                <Select value={newCategory} onValueChange={setNewCategory}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
                <Button onClick={addBookmark} className="w-full" disabled={!newUrl.trim()}>Save</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search bookmarks..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>

        {filtered.length === 0 ? (
          <Card className="p-8 text-center">
            <Bookmark className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No bookmarks saved yet</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {filtered.map(b => (
              <Card key={b.id} className="p-3 flex items-center justify-between group">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <button onClick={() => toggleFavorite(b)}>
                    <Star className={`w-4 h-4 ${b.is_favorite ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground"}`} />
                  </button>
                  <div className="min-w-0 flex-1">
                    <a href={b.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-foreground hover:text-primary flex items-center gap-1 truncate">
                      {b.title || b.url} <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                    {b.description && <p className="text-xs text-muted-foreground truncate">{b.description}</p>}
                    <Badge variant="outline" className="text-xs mt-1">{b.category}</Badge>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100" onClick={() => deleteBookmark(b.id)}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
