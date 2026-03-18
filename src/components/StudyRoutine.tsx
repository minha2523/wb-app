import { useState, useEffect } from 'react';
import { Calendar, Clock, BookOpen, Plus, Trash2, CheckCircle2, ListTodo } from 'lucide-react';

interface RoutineItem {
  id: string;
  day: string;
  subject: string;
  startTime: string;
  endTime: string;
  completed: boolean;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function StudyRoutine() {
  const [routines, setRoutines] = useState<RoutineItem[]>(() => {
    const saved = localStorage.getItem('study_routines');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [activeDay, setActiveDay] = useState(DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]);
  const [newSubject, setNewSubject] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');

  useEffect(() => {
    localStorage.setItem('study_routines', JSON.stringify(routines));
  }, [routines]);

  const addRoutine = () => {
    if (!newSubject) return;
    const newItem: RoutineItem = {
      id: crypto.randomUUID(),
      day: activeDay,
      subject: newSubject,
      startTime,
      endTime,
      completed: false,
    };
    setRoutines([...routines, newItem]);
    setNewSubject('');
  };

  const deleteRoutine = (id: string) => {
    setRoutines(routines.filter(r => r.id !== id));
  };

  const toggleComplete = (id: string) => {
    setRoutines(routines.map(r => r.id === id ? { ...r, completed: !r.completed } : r));
  };

  const filteredRoutines = routines
    .filter(r => r.day === activeDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Study Planner</h1>
          <p className="text-muted-foreground">Manage your weekly study routine efficiently</p>
        </header>

        {/* Day Selector */}
        <div className="flex flex-wrap justify-center gap-2">
          {DAYS.map(day => (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeDay === day 
                ? 'bg-primary text-primary-foreground shadow-lg' 
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              {day}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Add Routine Form */}
          <div className="md:col-span-1 space-y-4 bg-card p-6 rounded-xl border shadow-sm h-fit">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Plus className="w-5 h-5" /> Add Session
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Subject</label>
                <input
                  type="text"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="e.g. Mathematics"
                  className="w-full mt-1 p-2 rounded-md border bg-background"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Start</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full mt-1 p-2 rounded-md border bg-background"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">End</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full mt-1 p-2 rounded-md border bg-background"
                  />
                </div>
              </div>
              <button
                onClick={addRoutine}
                className="w-full bg-primary text-primary-foreground py-2 rounded-md font-medium hover:opacity-90 transition-opacity"
              >
                Add to {activeDay}
              </button>
            </div>
          </div>

          {/* Routine List */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold flex items-center gap-2">
                <Calendar className="w-6 h-6 text-primary" /> {activeDay}'s Schedule
              </h2>
              <span className="text-sm text-muted-foreground">{filteredRoutines.length} sessions</span>
            </div>

            {filteredRoutines.length === 0 ? (
              <div className="text-center py-12 bg-muted/30 rounded-xl border-2 border-dashed">
                <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-20" />
                <p className="text-muted-foreground">No study sessions planned for {activeDay}.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredRoutines.map((item) => (
                  <div
                    key={item.id}
                    className={`group flex items-center justify-between p-4 rounded-xl border transition-all ${
                      item.completed ? 'bg-muted/50 opacity-75' : 'bg-card hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => toggleComplete(item.id)}
                        className={`transition-colors ${item.completed ? 'text-green-500' : 'text-muted-foreground hover:text-primary'}`}
                      >
                        <CheckCircle2 className="w-6 h-6" />
                      </button>
                      <div>
                        <h3 className={`font-semibold ${item.completed ? 'line-through' : ''}`}>
                          {item.subject}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {item.startTime} - {item.endTime}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteRoutine(item.id)}
                      className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity p-2"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
