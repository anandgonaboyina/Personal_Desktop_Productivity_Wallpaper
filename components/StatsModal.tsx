'use client';
import { useDashboardStore } from '@/store/dashboardStore';
import { X, Flame, Calendar, Clock, BookOpen, GraduationCap, MessageCircle, ChevronDown, ChevronUp, CalendarDays } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getLocalDateString } from '@/utils/date';
import ScrollableWithArrows from './ScrollableWithArrows';

export default function StatsModal() {
  const { history, healthData, isStatsOpen, toggleStats } = useDashboardStore();
  const [expandedMonths, setExpandedMonths] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // When modal opens, auto-expand the current month
    if (isStatsOpen) {
      const d = new Date();
      const currentMonthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      setExpandedMonths({ [currentMonthKey]: true });
    }
  }, [isStatsOpen]);

  if (!isStatsOpen) return null;

  // Sort dates descending (newest first)
  const dates = Object.keys(history).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  const today = getLocalDateString();
  const todayMins = history[today] || 0;
  const totalMins = Object.values(history).reduce((acc, curr) => acc + curr, 0);

  // Group by month
  const monthlyData = dates.reduce((acc, date) => {
    const d = new Date(date);
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const monthName = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    if (!acc[monthKey]) {
      acc[monthKey] = { name: monthName, total: 0, academic: 0, reading: 0, english: 0, days: [] };
    }
    
    acc[monthKey].total += history[date] || 0;
    const hData = healthData[date];
    if (hData) {
      acc[monthKey].academic += hData.academic || 0;
      acc[monthKey].reading += hData.reading || 0;
      acc[monthKey].english += hData.english || 0;
    }
    acc[monthKey].days.push(date);
    return acc;
  }, {} as Record<string, { name: string, total: number, academic: number, reading: number, english: number, days: string[] }>);

  const sortedMonths = Object.keys(monthlyData).sort((a, b) => b.localeCompare(a));

  const toggleMonthExpand = (month: string) => {
    setExpandedMonths(prev => ({ ...prev, [month]: !prev[month] }));
  };

  const formatMinutes = (mins: number) => {
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours}h`;
  };

  return (
    <div 
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 pb-20 sm:p-8 sm:pb-24 bg-black/60 backdrop-blur-md animate-in fade-in duration-300"
      onClick={toggleStats}
    >
      <div 
        className="relative w-full h-[85vh] max-h-[850px] max-w-6xl rounded-[2.5rem] bg-black/80 backdrop-blur-3xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden animate-in zoom-in-95 fade-in duration-300 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-400 via-red-500 to-purple-600" />
        
        {/* Header */}
        <div className="flex-none p-6 md:px-10 md:py-8 flex justify-between items-center border-b border-white/5 bg-white/[0.02]">
          <h2 className="text-2xl md:text-4xl font-black tracking-tight flex items-center gap-4 drop-shadow-lg">
            <Flame className="text-orange-500" size={36} /> Focus History
          </h2>
          <button 
            onClick={toggleStats}
            className="p-3 text-white/50 hover:text-white hover:bg-white/10 hover:scale-110 rounded-full transition-all"
          >
            <X size={28} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          
          {/* Sidebar: Overall Stats */}
          <div className="md:w-[35%] lg:w-[30%] border-b md:border-b-0 md:border-r border-white/5 bg-black/40 flex flex-col relative">
            <ScrollableWithArrows className="p-6 md:p-8 flex flex-col gap-6">
            
            {/* Today */}
            <div className="p-8 rounded-[2rem] bg-gradient-to-br from-blue-500/20 to-blue-600/5 border border-blue-500/20 flex flex-col items-center justify-center text-center shadow-xl relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl group-hover:bg-blue-500/30 transition-colors" />
              <Clock className="mb-4 text-blue-400 drop-shadow-[0_0_10px_rgba(96,165,250,0.5)]" size={40} />
              <p className="text-5xl font-black text-white tracking-tight">{formatMinutes(todayMins)}</p>
              <p className="text-sm text-blue-200/60 uppercase tracking-[0.2em] mt-3 font-bold">Today's Focus</p>
            </div>
            
            {/* Total */}
            <div className="p-8 rounded-[2rem] bg-gradient-to-br from-green-500/20 to-green-600/5 border border-green-500/20 flex flex-col items-center justify-center text-center shadow-xl relative overflow-hidden group">
              <div className="absolute -left-4 -bottom-4 w-24 h-24 bg-green-500/20 rounded-full blur-2xl group-hover:bg-green-500/30 transition-colors" />
              <Calendar className="mb-4 text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.5)]" size={40} />
              <p className="text-5xl font-black text-white tracking-tight">{formatMinutes(totalMins)}</p>
              <p className="text-sm text-green-200/60 uppercase tracking-[0.2em] mt-3 font-bold">All Time Focus</p>
            </div>

            {/* Quick Summary */}
            <div className="mt-4 p-6 rounded-[2rem] bg-white/5 border border-white/5 shadow-lg">
               <h3 className="text-xs font-bold text-white/40 uppercase tracking-[0.2em] mb-5">Quick Summary</h3>
               <div className="flex flex-col gap-4">
                 <div className="flex justify-between items-center">
                   <span className="text-white/60 font-medium">Total Days Logged</span>
                   <span className="font-bold text-white bg-white/10 px-3 py-1 rounded-lg">{dates.length}</span>
                 </div>
                 <div className="flex justify-between items-center">
                   <span className="text-white/60 font-medium">Daily Average</span>
                   <span className="font-bold text-white bg-white/10 px-3 py-1 rounded-lg">
                     {dates.length ? formatMinutes(Math.floor(totalMins / dates.length)) : '0m'}
                   </span>
                 </div>
               </div>
            </div>
            </ScrollableWithArrows>
          </div>

          {/* Main Content: History */}
          <div className="md:w-[65%] lg:w-[70%] bg-transparent relative flex flex-col">
            <ScrollableWithArrows className="p-6 md:p-8">
            <h3 className="text-sm font-bold tracking-[0.2em] text-white/50 uppercase mb-6 sticky top-0 bg-black/80 backdrop-blur-xl p-4 rounded-2xl border border-white/5 z-10 shadow-lg text-center">
              Monthly & Daily Breakdown
            </h3>

            <div className="flex flex-col gap-5">
              {sortedMonths.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 opacity-50">
                  <Calendar size={64} className="mb-6 text-white/20" />
                  <p className="text-lg font-medium text-white/60">No focus sessions recorded yet. Start a timer!</p>
                </div>
              ) : (
                sortedMonths.map(monthKey => {
                  const data = monthlyData[monthKey];
                  const isMonthExpanded = expandedMonths[monthKey];

                  return (
                    <div key={monthKey} className="flex flex-col rounded-3xl bg-white/[0.02] border border-white/10 overflow-hidden shadow-xl transition-all duration-300">
                      
                      {/* Month Header */}
                      <div 
                        className="flex flex-wrap md:flex-nowrap justify-between items-center p-4 md:p-5 cursor-pointer hover:bg-white/5 transition-colors group relative overflow-hidden"
                        onClick={() => toggleMonthExpand(monthKey)}
                      >
                        <div className="absolute right-0 top-0 w-48 h-full bg-gradient-to-l from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        
                        <div className="flex items-center gap-4 relative z-10">
                          <div className="p-3 bg-white/5 rounded-2xl group-hover:bg-orange-500/20 group-hover:scale-105 transition-all duration-300">
                            <CalendarDays className="text-orange-400" size={24} />
                          </div>
                          <div>
                            <h4 className="text-xl font-black text-white/90 tracking-tight">{data.name}</h4>
                            <p className="text-xs text-white/50 mt-1 font-medium">{data.days.length} days recorded</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-6 mt-3 md:mt-0 relative z-10">
                          <div className="text-right">
                            <span className="block text-2xl font-black text-orange-400 drop-shadow-md">{formatMinutes(data.total)}</span>
                            <span className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold block mt-0.5">Total Hours</span>
                          </div>
                          <div className={`p-2 rounded-full bg-white/5 transition-transform duration-300 ${isMonthExpanded ? 'rotate-180' : ''}`}>
                            <ChevronDown size={20} className="text-white/60" />
                          </div>
                        </div>
                      </div>

                      {/* Monthly Health Totals */}
                      {isMonthExpanded && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 px-4 md:px-5 pb-4 border-b border-white/5 bg-black/20">
                            <div className="flex items-center gap-3 p-2 px-3 rounded-xl bg-purple-500/10 border border-purple-500/20 transition-transform hover:scale-105">
                               <div className="p-2 bg-purple-500/20 rounded-lg shrink-0">
                                 <GraduationCap size={16} className="text-purple-400" />
                               </div>
                               <div className="flex flex-col">
                                 <span className="text-[9px] text-purple-200/60 uppercase tracking-widest font-bold">Academic</span>
                                 <span className="text-sm font-bold text-purple-300">{formatMinutes(data.academic)}</span>
                               </div>
                            </div>
                            <div className="flex items-center gap-3 p-2 px-3 rounded-xl bg-pink-500/10 border border-pink-500/20 transition-transform hover:scale-105">
                               <div className="p-2 bg-pink-500/20 rounded-lg shrink-0">
                                 <BookOpen size={16} className="text-pink-400" />
                               </div>
                               <div className="flex flex-col">
                                 <span className="text-[9px] text-pink-200/60 uppercase tracking-widest font-bold">Reading</span>
                                 <span className="text-sm font-bold text-pink-300">{formatMinutes(data.reading)}</span>
                               </div>
                            </div>
                            <div className="flex items-center gap-3 p-2 px-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 transition-transform hover:scale-105">
                               <div className="p-2 bg-yellow-500/20 rounded-lg shrink-0">
                                 <MessageCircle size={16} className="text-yellow-400" />
                               </div>
                               <div className="flex flex-col">
                                 <span className="text-[9px] text-yellow-200/60 uppercase tracking-widest font-bold">Vocab</span>
                                 <span className="text-sm font-bold text-yellow-300">{data.english} w</span>
                               </div>
                            </div>
                        </div>
                      )}

                      {/* Days inside Month */}
                      {isMonthExpanded && (
                        <div className="flex flex-col p-3 md:p-4 bg-black/40 gap-2">
                          {data.days.map((date: string) => {
                            const hData = healthData[date];
                            return (
                              <div key={date} className="flex flex-col md:flex-row items-center justify-between p-3 rounded-xl bg-white/[0.03] hover:bg-white/10 transition-colors border border-white/5 gap-3">
                                <div className="flex items-center gap-3 min-w-max self-start md:self-auto">
                                  <div className="w-1.5 h-1.5 rounded-full bg-orange-400/50" />
                                  <span className="font-medium text-white/80 text-sm">{new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                                </div>
                                
                                <div className="flex flex-wrap md:flex-nowrap items-center gap-3 w-full md:w-auto justify-end">
                                  {hData && (
                                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                      <div className="flex items-center gap-1.5 text-[11px] text-purple-300 bg-purple-500/10 px-2 py-1 rounded-md" title="Academic">
                                        <GraduationCap size={12}/> <span className="opacity-80">Academic</span> <span className="font-bold">{formatMinutes(hData.academic || 0)}</span>
                                      </div>
                                      <div className="flex items-center gap-1.5 text-[11px] text-pink-300 bg-pink-500/10 px-2 py-1 rounded-md" title="Reading">
                                        <BookOpen size={12}/> <span className="opacity-80">Reading</span> <span className="font-bold">{formatMinutes(hData.reading || 0)}</span>
                                      </div>
                                      <div className="flex items-center gap-1.5 text-[11px] text-yellow-300 bg-yellow-500/10 px-2 py-1 rounded-md" title="Vocab">
                                        <MessageCircle size={12}/> <span className="opacity-80">Vocab</span> <span className="font-bold">{hData.english || 0}</span>
                                      </div>
                                    </div>
                                  )}
                                  <span className="font-bold text-orange-200 bg-orange-500/10 px-3 py-1 rounded-lg border border-orange-500/20 shadow-inner text-sm shrink-0 mt-2 md:mt-0 ml-auto md:ml-0">
                                    {formatMinutes(history[date])}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
            </ScrollableWithArrows>
          </div>
        </div>
      </div>
    </div>
  );
}

