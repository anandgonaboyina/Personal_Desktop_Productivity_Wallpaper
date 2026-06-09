"use client";

import { useDashboardStore } from "@/store/dashboardStore";
import { CalendarDays, Edit2, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const WEEKENDS = ["Sat", "Sun"];
const TIMES = ["09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"];

export default function Timetable() {
  const { timetableGrid, updateTimetableCell } = useDashboardStore();
  const [currentDayIndex, setCurrentDayIndex] = useState(-1);
  const [viewMode, setViewMode] = useState<"weekdays" | "weekends">("weekdays");

  useEffect(() => {
    const day = new Date().getDay(); // 0=Sun, 1=Mon, ..., 5=Fri, 6=Sat
    setCurrentDayIndex(day);
    if (day === 0 || day === 6) {
      setViewMode("weekends");
    }
  }, []);

  const activeDays = viewMode === "weekdays" ? WEEKDAYS : WEEKENDS;

  return (
    <div className="bg-black/50 backdrop-blur-3xl border border-white/10 rounded-3xl p-2 shadow-2xl w-full max-w-5xl pointer-events-auto">
      <div className="flex items-center justify-between text-white/80 mb-4 pb-2 border-b border-white/10 mt-2 px-4">
        <button 
          onClick={() => setViewMode(viewMode === "weekdays" ? "weekends" : "weekdays")}
          className="p-1.5 hover:bg-white/10 rounded-xl transition-colors"
          title="Previous view"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="flex items-center gap-2">
          <CalendarDays size={20} className="text-purple-400" />
          <span className="font-bold tracking-widest uppercase text-base">
            {viewMode === "weekdays" ? "Weekly Schedule" : "Weekend Schedule"}
          </span>
        </div>

        <button 
          onClick={() => setViewMode(viewMode === "weekdays" ? "weekends" : "weekdays")}
          className="p-1.5 hover:bg-white/10 rounded-xl transition-colors"
          title="Next view"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="overflow-x-auto custom-scrollbar pb-2 px-2">
        <div className={`min-w-[700px] grid gap-2 ${viewMode === "weekdays" ? "grid-cols-6" : "grid-cols-3"}`}>

          {/* Time Column */}
          <div className="flex flex-col gap-1">
            <div className="text-center font-bold text-white/40 uppercase tracking-widest text-xs py-2 mb-2">Time</div>
            {TIMES.map(time => (
              <div key={time} className="flex items-center justify-center font-mono text-white/80 text-sm font-semibold bg-black/20 rounded-xl border border-white/5 h-12 px-1">
                {time}
              </div>
            ))}
          </div>

          {/* Day Columns */}
          {activeDays.map((day) => {
            const dayIndexMap: Record<string, number> = { "Sun": 0, "Mon": 1, "Tue": 2, "Wed": 3, "Thu": 4, "Fri": 5, "Sat": 6 };
            const isToday = currentDayIndex === dayIndexMap[day];
            return (
              <div key={day} className={`flex flex-col gap-1 rounded-2xl p-1 transition-colors ${isToday ? 'bg-purple-500/10 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.2)]' : ''}`}>
                <div className={`text-center font-bold uppercase tracking-widest text-sm py-2 rounded-xl border mb-1 ${isToday ? 'bg-purple-500/20 text-purple-200 border-purple-500/30' : 'bg-white/5 text-white/80 border-white/5'}`}>
                  {day}
                </div>

                {TIMES.map((time, index) => {
                  const subject = timetableGrid?.[day]?.[time] || "";

                  // Visual Merging Logic
                  const prevTime = index > 0 ? TIMES[index - 1] : null;
                  const prevSubject = prevTime ? (timetableGrid?.[day]?.[prevTime] || "") : "";

                  const nextTime = index < TIMES.length - 1 ? TIMES[index + 1] : null;
                  const nextSubject = nextTime ? (timetableGrid?.[day]?.[nextTime] || "") : "";

                  const isContinuation = subject !== "" && subject === prevSubject;
                  const isContinuedByNext = subject !== "" && subject === nextSubject;

                  let roundedClass = 'rounded-xl';
                  if (isContinuation && isContinuedByNext) roundedClass = 'rounded-none';
                  else if (isContinuation) roundedClass = 'rounded-b-xl rounded-t-sm';
                  else if (isContinuedByNext) roundedClass = 'rounded-t-xl rounded-b-sm';

                  const textClass = isContinuation ? 'text-transparent focus:text-white' : 'text-white';
                  const borderClass = isContinuation ? 'border-t-transparent' : 'border-transparent';

                  return (
                    <div key={time} className="relative group h-12">
                      <input
                        type="text"
                        value={subject}
                        onChange={(e) => updateTimetableCell(day, time, e.target.value)}
                        placeholder="Free"
                        className={`w-full h-full text-center hover:bg-white/10 focus:bg-white/10 border ${borderClass} focus:border-purple-500/50 ${roundedClass} ${textClass} text-sm outline-none transition-all placeholder:text-white/20 z-10 relative focus:z-20 ${isToday ? 'bg-purple-500/10' : 'bg-white/5'}`}
                      />
                      <Edit2 size={10} className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-30 pointer-events-none text-white z-20" />
                    </div>
                  );
                })}
              </div>
            );
          })}

        </div>
      </div>
    </div>
  );
}
