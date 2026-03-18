import React, { useState, useEffect } from 'react';
import { Plus, BookOpen, Clock, BarChart3, Trash2, CheckCircle2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { format } from 'date-fns';

interface StudySession {
  id: string;
  subject: string;
  duration: number; // in minutes
  date: string;
}

const StudyTracker = () => {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [subject, setSubject] = useState('');
  const [duration, setDuration] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('study-sessions');
    if (saved) setSessions(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('study-sessions', JSON.stringify(sessions));
  }, [sessions]);

  const addSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !duration) return;

    const newSession: StudySession = {
      id: crypto.randomUUID(),
      subject,
      duration: parseInt(duration),
      date: format(new Date(), 'yyyy-MM-dd'),
    };

    setSessions([newSession, ...sessions]);
    setSubject('');
    setDuration('');
  };

  const deleteSession = (id: string) => {
    setSessions(sessions.filter(s => s.id !== id));
  };

  const totalMinutes = sessions.reduce((acc, curr) => acc + curr.duration, 0);
  
  const chartData = sessions.reduce((acc: any[], curr) => {
    const existing = acc.find(item => item.subject === curr.subject);
    if (existing) {
      existing.minutes += curr.duration;
    } else {
      acc.push({ subject: curr.subject, minutes: curr.duration });
    }
    return acc;
  }, []).slice(0, 5);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Study Focus tool by Minha</h1>
            <p className="text-muted-foreground">Track your learning progress daily.</p>
          </div>
          <div className="bg-primary/10 p-3 rounded-full">
            <BookOpen className="w-6 h-6 text-primary" />
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">Total Focus Time</span>
            </div>
            <div className="text-2xl font-bold">{Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m</div>
          </div>
          <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-sm font-medium">Sessions Done</span>
            </div>
            <div className="text-2xl font-bold">{sessions.length}</div>
          </div>
          <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <BarChart3 className="w-4 h-4" />
              <span className="text-sm font-medium">Subjects</span>
            </div>
            <div className="text-2xl font-bold">{new Set(sessions.map(s => s.subject)).size}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section className="bg-card p-6 rounded-xl border border-border shadow-sm">
            <h2 className="text-xl font-semibold mb-6">Log New Session</h2>
            <form onSubmit={addSession} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Mathematics"
                  className="w-full bg-background border border-input rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Duration (minutes)</label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g. 45"
                  className="w-full bg-background border border-input rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-primary text-primary-foreground font-medium py-2 rounded-md hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Session
              </button>
            </form>
          </section>

          <section className="bg-card p-6 rounded-xl border border-border shadow-sm">
            <h2 className="text-xl font-semibold mb-6">Subject Breakdown</h2>
            <div className="h-[200px] w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                    <XAxis dataKey="subject" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                    />
                    <Bar dataKey="minutes" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={`hsl(var(--primary) / ${1 - index * 0.1})`} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                  Log a session to see analytics
                </div>
              )}
            </div>
          </section>
        </div>

        <section className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-semibold">Recent Activity</h2>
          </div>
          <div className="divide-y divide-border">
            {sessions.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                No study sessions recorded yet. Start learning!
              </div>
            ) : (
              sessions.map((session) => (
                <div key={session.id} className="p-4 flex items-center justify-between hover:bg-accent/50 transition-colors">
                  <div>
                    <h3 className="font-medium">{session.subject}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{session.duration} minutes</span>
                      <span>•</span>
                      <span>{session.date}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteSession(session.id)}
                    className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default StudyTracker;