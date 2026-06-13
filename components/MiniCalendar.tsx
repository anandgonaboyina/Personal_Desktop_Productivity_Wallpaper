'use client';
import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Trash, ListTodo, Calendar as CalendarIcon } from 'lucide-react';
import { useDashboardStore } from '@/store/dashboardStore';

export default function MiniCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showAllDeadlines, setShowAllDeadlines] = useState(false);
  
  const { deadlines, addDeadline, updateDeadline, deleteDeadline } = useDashboardStore();
  
  const today = new Date();
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const formatDate = (date: Date, day: number) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const dayDeadlines = selectedDate ? deadlines.filter(d => d.date === selectedDate) : [];
  const sortedAllDeadlines = [...deadlines].sort((a,b) => a.date.localeCompare(b.date));

  return (
    <div className="bg-black/20 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 w-72 shadow-2xl min-h-[340px] flex flex-col relative overflow-hidden transition-all duration-300">
      {showAllDeadlines ? (
        <div className="flex flex-col h-full flex-1 animate-in slide-in-from-right-4 duration-300">
          <div className="flex items-center mb-4 pb-2 border-b border-white/10">
            <button onClick={() => setShowAllDeadlines(false)} className="p-1 hover:bg-white/10 rounded-lg text-white/70 transition-colors">
              <ChevronLeft size={18} />
            </button>
            <span className="text-white font-medium ml-2 flex items-center gap-2"><ListTodo size={16} className="text-blue-400" /> All Deadlines</span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2 pr-2 arrow-scrollbar max-h-[240px]">
            {sortedAllDeadlines.length === 0 && <div className="text-white/40 text-sm text-center mt-6 italic">No upcoming deadlines</div>}
            {sortedAllDeadlines.map(d => (
              <div key={d.id} className="flex flex-col gap-1 bg-white/5 hover:bg-white/10 p-3 rounded-xl border border-white/10 transition-colors group">
                <div className="flex justify-between items-center">
                  <span className="text-red-400 text-xs font-bold tracking-wider">{d.date}</span>
                  <button onClick={() => deleteDeadline(d.id)} className="text-red-400/50 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                     <Trash size={14} />
                  </button>
                </div>
                <span className="text-white/90 text-sm leading-snug">{d.text || <span className="text-white/30 italic">Empty deadline</span>}</span>
              </div>
            ))}
          </div>
        </div>
      ) : selectedDate ? (
        <div className="flex flex-col h-full flex-1 animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center mb-4 pb-2 border-b border-white/10">
            <button onClick={() => setSelectedDate(null)} className="p-1 hover:bg-white/10 rounded-lg text-white/70 transition-colors">
              <ChevronLeft size={18} />
            </button>
            <div className="flex flex-col ml-2">
              <span className="text-white font-medium text-sm">Deadlines for</span>
              <span className="text-red-400 text-xs font-bold tracking-wider">{selectedDate}</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2 pr-2 arrow-scrollbar max-h-[220px]">
            {dayDeadlines.length === 0 && <div className="text-white/40 text-xs text-center my-2">No deadlines set for this day.</div>}
            {dayDeadlines.map(d => (
              <div key={d.id} className="flex gap-2 items-center bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 focus-within:border-blue-500/30 transition-all group shadow-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_red] shrink-0" />
                <input 
                  type="text"
                  value={d.text} 
                  onChange={e => updateDeadline(d.id, e.target.value)}
                  className="flex-1 bg-transparent outline-none text-white/90 text-sm h-8 leading-tight placeholder:text-white/30 border-b border-transparent focus:border-white/20 transition-colors"
                  placeholder="Enter deadline here..."
                  autoFocus
                />
                <button onClick={() => deleteDeadline(d.id)} className="text-white/20 hover:text-red-400 p-1.5 transition-colors">
                   <Trash size={14} />
                </button>
              </div>
            ))}
            <button 
               onClick={() => addDeadline(selectedDate, "")}
               className="w-full py-2.5 mt-2 flex items-center justify-center gap-1.5 text-xs font-bold text-white/70 bg-white/5 hover:bg-white/10 hover:text-white rounded-xl transition-all border border-dashed border-white/20 hover:border-white/40"
            >
              <Plus size={14} /> ADD DEADLINE
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col flex-1 animate-in fade-in duration-500">
          {/* Header */}
          <div className="flex justify-between items-center mb-5">
            <button onClick={prevMonth} className="p-1.5 bg-white/5 hover:bg-white/10 rounded-xl text-white/70 hover:text-white transition-all border border-white/5">
              <ChevronLeft size={16} />
            </button>
            <div className="text-white font-semibold tracking-wide text-sm">
              {monthNames[currentDate.getMonth()]} <span className="text-white/50">{currentDate.getFullYear()}</span>
            </div>
            <button onClick={nextMonth} className="p-1.5 bg-white/5 hover:bg-white/10 rounded-xl text-white/70 hover:text-white transition-all border border-white/5">
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Days Header */}
          <div className="grid grid-cols-7 gap-1 text-center mb-3">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
              <div key={d} className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{d}</div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-y-2 gap-x-1 text-center mb-auto">
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`blank-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = formatDate(currentDate, day);
              const hasDeadline = deadlines.some(d => d.date === dateStr);
              const isToday = 
                day === today.getDate() && 
                currentDate.getMonth() === today.getMonth() && 
                currentDate.getFullYear() === today.getFullYear();

              return (
                <div
                  key={day}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`relative h-8 w-8 rounded-full flex items-center justify-center text-xs mx-auto transition-all cursor-pointer group
                    ${isToday ? 'bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)] font-bold border border-blue-400' 
                    : hasDeadline ? 'bg-red-500/20 text-red-200 border border-red-500/40 hover:bg-red-500/40 font-semibold shadow-inner' 
                    : 'text-white/70 hover:bg-white/10 hover:text-white font-medium border border-transparent'}`}
                >
                  {day}
                  {hasDeadline && !isToday && (
                    <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-black/50 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                  )}
                  {hasDeadline && isToday && (
                    <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-blue-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer Button */}
          <div className="mt-5 pt-4 border-t border-white/10">
            <button 
              onClick={() => setShowAllDeadlines(true)}
              className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-semibold text-white/80 hover:text-white transition-all flex items-center justify-center gap-2 group"
            >
              <ListTodo size={14} className="text-white/50 group-hover:text-blue-400 transition-colors" />
              VIEW ALL DEADLINES
              {deadlines.length > 0 && (
                <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full ml-1 shadow-[0_0_8px_rgba(239,68,68,0.6)]">
                  {deadlines.length}
                </span>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
