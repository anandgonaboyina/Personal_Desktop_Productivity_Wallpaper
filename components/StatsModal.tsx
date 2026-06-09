'use client';
import { useDashboardStore } from '@/store/dashboardStore';
import { X, Flame, Calendar, Clock } from 'lucide-react';

export default function StatsModal() {
  const { history, isStatsOpen, toggleStats } = useDashboardStore();

  if (!isStatsOpen) return null;

  // Sort dates descending (newest first)
  const dates = Object.keys(history).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  const today = new Date().toISOString().split('T')[0];
  const todayMins = history[today] || 0;
  const totalMins = Object.values(history).reduce((acc, curr) => acc + curr, 0);

  return (
    <div 
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={toggleStats}
    >
      <div 
        className="relative w-full max-w-md rounded-3xl bg-black/60 backdrop-blur-2xl border border-white/20 shadow-2xl p-6 text-white overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-red-500" />
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-medium tracking-wide flex items-center gap-2">
            <Flame className="text-orange-400" /> Focus History
          </h2>
          <button 
            onClick={toggleStats}
            className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center text-center">
            <Clock className="mb-2 text-blue-400" size={24} />
            <p className="text-3xl font-bold">{todayMins}</p>
            <p className="text-xs text-white/50 uppercase tracking-widest mt-1">Mins Today</p>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center text-center">
            <Calendar className="mb-2 text-green-400" size={24} />
            <p className="text-3xl font-bold">{totalMins}</p>
            <p className="text-xs text-white/50 uppercase tracking-widest mt-1">Total Mins</p>
          </div>
        </div>

        <h3 className="text-sm font-semibold tracking-widest text-white/50 uppercase mb-3">Daily Breakdown</h3>
        
        <div className="max-h-[250px] overflow-y-auto pr-2 flex flex-col gap-2 scrollbar-thin scrollbar-thumb-white/20">
          {dates.length === 0 ? (
            <p className="text-center text-white/40 italic py-4">No focus sessions recorded yet. Start a timer!</p>
          ) : (
            dates.map(date => (
              <div key={date} className="flex justify-between items-center p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                <span className="font-medium text-white/80">{new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                <span className="font-bold text-orange-300">{history[date]} <span className="text-xs text-white/40 font-normal">min</span></span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
