import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, CheckSquare, Clock, Target } from "lucide-react";
import AppLayout from "@/components/aria/AppLayout";

export default function AriaCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState<any[]>([]);
  const [reminders, setReminders] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => { loadEvents(); }, [currentDate]);

  const loadEvents = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString();
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59).toISOString();

    const [tasksRes, remindersRes] = await Promise.all([
      supabase.from("aria_tasks").select("*").eq("user_id", user.id).gte("due_at", startOfMonth).lte("due_at", endOfMonth),
      supabase.from("aria_reminders").select("*").eq("user_id", user.id).gte("remind_at", startOfMonth).lte("remind_at", endOfMonth),
    ]);
    setTasks(tasksRes.data || []);
    setReminders(remindersRes.data || []);
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date().toISOString().split("T")[0];

  const getEventsForDate = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const dayTasks = tasks.filter((t) => t.due_at?.startsWith(dateStr));
    const dayReminders = reminders.filter((r) => r.remind_at?.startsWith(dateStr));
    return { tasks: dayTasks, reminders: dayReminders, dateStr };
  };

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const monthName = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const selectedEvents = selectedDate ? (() => {
    const day = parseInt(selectedDate.split("-")[2]);
    return getEventsForDate(day);
  })() : null;

  return (
    <AppLayout>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Calendar</h1>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={prevMonth}><ChevronLeft className="w-5 h-5" /></Button>
            <span className="text-lg font-semibold text-foreground min-w-[180px] text-center">{monthName}</span>
            <Button variant="ghost" size="icon" onClick={nextMonth}><ChevronRight className="w-5 h-5" /></Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="grid grid-cols-7 gap-px">
                {weekDays.map((d) => (
                  <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">{d}</div>
                ))}
                {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                  <div key={`e-${i}`} className="p-2" />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const { tasks: dt, reminders: dr, dateStr } = getEventsForDate(day);
                  const isToday = dateStr === today;
                  const isSelected = dateStr === selectedDate;
                  const hasEvents = dt.length > 0 || dr.length > 0;

                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDate(dateStr)}
                      className={`p-2 rounded-lg text-sm transition-colors relative ${
                        isSelected ? "bg-primary text-primary-foreground" :
                        isToday ? "bg-primary/10 text-primary font-bold" :
                        "hover:bg-muted text-foreground"
                      }`}
                    >
                      {day}
                      {hasEvents && (
                        <div className="flex gap-0.5 justify-center mt-0.5">
                          {dt.length > 0 && <div className="w-1 h-1 rounded-full bg-blue-400" />}
                          {dr.length > 0 && <div className="w-1 h-1 rounded-full bg-amber-400" />}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Sidebar */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                {selectedDate ? new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }) : "Select a date"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {!selectedEvents ? (
                <p className="text-sm text-muted-foreground">Click a date to see events</p>
              ) : selectedEvents.tasks.length === 0 && selectedEvents.reminders.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nothing scheduled</p>
              ) : (
                <>
                  {selectedEvents.tasks.map((t: any) => (
                    <div key={t.id} className="flex items-center gap-2 p-2 rounded bg-muted/50">
                      <CheckSquare className="w-4 h-4 text-blue-400 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm text-foreground truncate">{t.title}</p>
                        <p className="text-xs text-muted-foreground">{t.priority} • {t.category}</p>
                      </div>
                    </div>
                  ))}
                  {selectedEvents.reminders.map((r: any) => (
                    <div key={r.id} className="flex items-center gap-2 p-2 rounded bg-muted/50">
                      <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm text-foreground truncate">{r.title}</p>
                        <p className="text-xs text-muted-foreground">{new Date(r.remind_at).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
