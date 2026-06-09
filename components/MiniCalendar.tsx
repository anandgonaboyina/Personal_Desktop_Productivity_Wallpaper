'use client';
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function MiniCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const today = new Date();
  
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <div className="bg-black/20 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 w-72 shadow-2xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <button onClick={prevMonth} className="p-1 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors">
          <ChevronLeft size={20} />
        </button>
        <div className="text-white font-medium tracking-wide">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </div>
        <button onClick={nextMonth} className="p-1 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors">
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Days Header */}
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
          <div key={d} className="text-xs font-semibold text-white/40">{d}</div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <div key={`blank-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const isToday = 
            day === today.getDate() && 
            currentDate.getMonth() === today.getMonth() && 
            currentDate.getFullYear() === today.getFullYear();

          return (
            <div
              key={day}
              className={`h-8 w-8 rounded-full flex items-center justify-center text-sm mx-auto transition-all cursor-default
                ${isToday ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/40 font-bold' : 'text-white/80 hover:bg-white/10'}`}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
}
