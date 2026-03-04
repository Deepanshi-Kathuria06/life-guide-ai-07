import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileText, Search, Grid, List, Trash2, Sparkles, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AppLayout from "@/components/aria/AppLayout";

const docCategories = ["legal", "finance", "medical", "personal", "work", "other"];

export default function AriaDocuments() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [uploading, setUploading] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [summarizing, setSummarizing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploadData, setUploadData] = useState({ title: "", category: "other", notes: "" });
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => { loadDocuments(); }, []);

  const loadDocuments = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("aria_documents").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    setDocuments(data || []);
  };

  const handleUpload = async () => {
    if (!uploadFile || !uploadData.title.trim()) return;
    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const filePath = `${user.id}/${Date.now()}-${uploadFile.name}`;
      const { error: uploadError } = await supabase.storage.from("aria-documents").upload(filePath, uploadFile);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from("aria-documents").getPublicUrl(filePath);

      await supabase.from("aria_documents").insert({
        user_id: user.id,
        title: uploadData.title,
        file_url: filePath,
        file_type: uploadFile.type,
        file_size: uploadFile.size,
        category: uploadData.category,
        notes: uploadData.notes || null,
      });

      toast({ title: "Document uploaded" });
      setUploadDialogOpen(false);
      setUploadFile(null);
      setUploadData({ title: "", category: "other", notes: "" });
      loadDocuments();
    } catch (e: any) {
      toast({ title: "Upload failed", description: e.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const summarizeDoc = async (doc: any) => {
    setSummarizing(true);
    try {
      const { data, error } = await supabase.functions.invoke("aria-summarize", {
        body: { text: `Document: ${doc.title}\nCategory: ${doc.category}\nNotes: ${doc.notes || "None"}`, type: "document" },
      });
      if (error) throw error;
      await supabase.from("aria_documents").update({ summary: data.summary }).eq("id", doc.id);
      setSelectedDoc({ ...doc, summary: data.summary });
      toast({ title: "Summary generated" });
      loadDocuments();
    } catch (e: any) {
      toast({ title: "Summary failed", description: e.message, variant: "destructive" });
    } finally {
      setSummarizing(false);
    }
  };

  const deleteDoc = async (id: string) => {
    await supabase.from("aria_documents").delete().eq("id", id);
    loadDocuments();
  };

  const filtered = documents.filter((d) =>
    d.title.toLowerCase().includes(search.toLowerCase()) ||
    d.category.toLowerCase().includes(search.toLowerCase())
  );

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  };

  return (
    <AppLayout>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-foreground">Document Vault</h1>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-muted border-border w-48" />
            </div>
            <Button variant="outline" size="icon" onClick={() => setView(view === "grid" ? "list" : "grid")}>
              {view === "grid" ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
            </Button>
            <Button onClick={() => setUploadDialogOpen(true)}><Upload className="w-4 h-4 mr-1" /> Upload</Button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="py-12 text-center text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No documents yet. Upload your first document!</p>
            </CardContent>
          </Card>
        ) : (
          <div className={view === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-2"}>
            {filtered.map((doc) => (
              <Card key={doc.id} className="bg-card border-border hover:border-primary/30 transition-colors cursor-pointer group" onClick={() => setSelectedDoc(doc)}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <FileText className="w-8 h-8 text-primary shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{doc.title}</p>
                      <div className="flex gap-2 mt-1">
                        <span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary">{doc.category}</span>
                        {doc.file_size && <span className="text-xs text-muted-foreground">{formatSize(doc.file_size)}</span>}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{new Date(doc.created_at).toLocaleDateString()}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 h-7 w-7" onClick={(e) => { e.stopPropagation(); deleteDoc(doc.id); }}>
                      <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Upload Dialog */}
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogContent className="bg-card border-border">
            <DialogHeader><DialogTitle>Upload Document</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>File</Label>
                <Input type="file" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setUploadFile(f); if (!uploadData.title) setUploadData({ ...uploadData, title: f.name }); } }} className="bg-muted border-border" />
              </div>
              <div><Label>Title</Label><Input value={uploadData.title} onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })} className="bg-muted border-border" /></div>
              <div><Label>Category</Label>
                <Select value={uploadData.category} onValueChange={(v) => setUploadData({ ...uploadData, category: v })}>
                  <SelectTrigger className="bg-muted border-border"><SelectValue /></SelectTrigger>
                  <SelectContent>{docCategories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Notes</Label><Input value={uploadData.notes} onChange={(e) => setUploadData({ ...uploadData, notes: e.target.value })} className="bg-muted border-border" /></div>
              <Button onClick={handleUpload} disabled={uploading || !uploadFile} className="w-full">
                {uploading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Upload className="w-4 h-4 mr-1" />} Upload
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Doc Detail Dialog */}
        <Dialog open={!!selectedDoc} onOpenChange={() => setSelectedDoc(null)}>
          <DialogContent className="bg-card border-border max-w-lg">
            <DialogHeader><DialogTitle>{selectedDoc?.title}</DialogTitle></DialogHeader>
            {selectedDoc && (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary">{selectedDoc.category}</span>
                  <span className="text-xs text-muted-foreground">{selectedDoc.file_type}</span>
                  {selectedDoc.file_size && <span className="text-xs text-muted-foreground">{formatSize(selectedDoc.file_size)}</span>}
                </div>
                {selectedDoc.notes && <p className="text-sm text-muted-foreground">{selectedDoc.notes}</p>}
                {selectedDoc.summary ? (
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="text-xs font-medium text-primary mb-1">AI Summary</p>
                    <p className="text-sm text-foreground whitespace-pre-wrap">{selectedDoc.summary}</p>
                  </div>
                ) : (
                  <Button variant="outline" onClick={() => summarizeDoc(selectedDoc)} disabled={summarizing}>
                    {summarizing ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Sparkles className="w-4 h-4 mr-1" />}
                    Summarize with ARIA
                  </Button>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
