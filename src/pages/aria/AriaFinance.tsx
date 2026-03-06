import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import AppLayout from "@/components/aria/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Plus, TrendingUp, TrendingDown, Wallet, DollarSign, Trash2 } from "lucide-react";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";

const EXPENSE_CATEGORIES = ["food", "transport", "shopping", "entertainment", "bills", "health", "education", "subscriptions", "other"];
const INCOME_CATEGORIES = ["salary", "freelance", "investment", "gift", "refund", "other"];

type Transaction = {
  id: string;
  amount: number;
  type: string;
  category: string;
  description: string | null;
  date: string;
  created_at: string;
};

export default function AriaFinance() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newAmount, setNewAmount] = useState("");
  const [newType, setNewType] = useState("expense");
  const [newCategory, setNewCategory] = useState("other");
  const [newDescription, setNewDescription] = useState("");
  const [newDate, setNewDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) { setUserId(user.id); loadTransactions(user.id); }
    });
  }, []);

  const loadTransactions = async (uid: string) => {
    const { data } = await supabase.from("aria_expenses").select("*").eq("user_id", uid)
      .order("date", { ascending: false }).limit(100);
    if (data) setTransactions(data as Transaction[]);
  };

  const addTransaction = async () => {
    if (!newAmount || !userId) return;
    await supabase.from("aria_expenses").insert({
      user_id: userId, amount: parseFloat(newAmount), type: newType,
      category: newCategory, description: newDescription || null, date: newDate,
    });
    await supabase.from("aria_xp_logs").insert({ user_id: userId, xp_amount: 3, source: "finance_log", description: "Logged a transaction" });
    setNewAmount(""); setNewDescription(""); setDialogOpen(false);
    loadTransactions(userId);
    toast({ title: "+3 XP! Transaction added" });
  };

  const deleteTransaction = async (id: string) => {
    if (!userId) return;
    await supabase.from("aria_expenses").delete().eq("id", id);
    loadTransactions(userId);
  };

  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const thisMonth = transactions.filter(t => new Date(t.date) >= monthStart && new Date(t.date) <= monthEnd);
  const totalIncome = thisMonth.filter(t => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
  const totalExpenses = thisMonth.filter(t => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);
  const balance = totalIncome - totalExpenses;

  const categoryBreakdown = thisMonth.filter(t => t.type === "expense").reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
    return acc;
  }, {} as Record<string, number>);

  return (
    <AppLayout>
      <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Finance Tracker</h1>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" /> Add Transaction</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Transaction</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <Tabs value={newType} onValueChange={setNewType}>
                  <TabsList className="w-full">
                    <TabsTrigger value="expense" className="flex-1">Expense</TabsTrigger>
                    <TabsTrigger value="income" className="flex-1">Income</TabsTrigger>
                  </TabsList>
                </Tabs>
                <Input type="number" placeholder="Amount" value={newAmount} onChange={e => setNewAmount(e.target.value)} />
                <Select value={newCategory} onValueChange={setNewCategory}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(newType === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES).map(c =>
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <Input placeholder="Description (optional)" value={newDescription} onChange={e => setNewDescription(e.target.value)} />
                <Input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} />
                <Button onClick={addTransaction} className="w-full" disabled={!newAmount}>Add</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <p className="text-xs text-muted-foreground">Income</p>
            </div>
            <p className="text-xl font-bold text-green-500">₹{totalIncome.toLocaleString()}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="w-4 h-4 text-red-500" />
              <p className="text-xs text-muted-foreground">Expenses</p>
            </div>
            <p className="text-xl font-bold text-red-500">₹{totalExpenses.toLocaleString()}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Wallet className="w-4 h-4 text-primary" />
              <p className="text-xs text-muted-foreground">Balance</p>
            </div>
            <p className={`text-xl font-bold ${balance >= 0 ? "text-green-500" : "text-red-500"}`}>₹{balance.toLocaleString()}</p>
          </Card>
        </div>

        {/* Category Breakdown */}
        {Object.keys(categoryBreakdown).length > 0 && (
          <Card className="p-4">
            <h3 className="font-semibold text-foreground mb-3">This Month by Category</h3>
            <div className="space-y-2">
              {Object.entries(categoryBreakdown).sort((a, b) => b[1] - a[1]).map(([cat, amt]) => (
                <div key={cat} className="flex items-center justify-between">
                  <span className="text-sm capitalize text-foreground">{cat}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${(amt / totalExpenses) * 100}%` }} />
                    </div>
                    <span className="text-sm font-medium text-foreground w-20 text-right">₹{amt.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Transaction List */}
        <div className="space-y-2">
          <h3 className="font-semibold text-foreground">Recent Transactions</h3>
          {transactions.length === 0 ? (
            <Card className="p-8 text-center"><p className="text-muted-foreground">No transactions yet</p></Card>
          ) : transactions.map(t => (
            <Card key={t.id} className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${t.type === "income" ? "bg-green-500/10" : "bg-red-500/10"}`}>
                  {t.type === "income" ? <TrendingUp className="w-4 h-4 text-green-500" /> : <TrendingDown className="w-4 h-4 text-red-500" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{t.description || t.category}</p>
                  <p className="text-xs text-muted-foreground">{format(new Date(t.date), "MMM d")} · <Badge variant="outline" className="text-xs">{t.category}</Badge></p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`font-semibold ${t.type === "income" ? "text-green-500" : "text-red-500"}`}>
                  {t.type === "income" ? "+" : "-"}₹{Number(t.amount).toLocaleString()}
                </span>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteTransaction(t.id)}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
