"use client";

import Dock from "@/components/Navbar";
import BigClock from "@/components/BigClock";
import Timer from "@/components/Timer";
import TaskManager from "@/components/TaskManager";
import QuotePopup from "@/components/QuotePopup";
import StatsModal from "@/components/StatsModal";
import NotesManager from "@/components/NotesManager";
import PlansManager from "@/components/PlansManager";
import MiniCalendar from "@/components/MiniCalendar";
import Countdown from "@/components/Countdown";
import Timetable from "@/components/Timetable";
import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, CalendarDays } from "lucide-react";
import { useDashboardStore } from "@/store/dashboardStore";
import { fetchQuote } from "@/utils/quoteEngine";

export default function Dashboard() {
  const showQuotePopup = useDashboardStore((state) => state.showQuotePopup);
  const isHidden = useDashboardStore((state) => state.isHidden);
  const toggleHide = useDashboardStore((state) => state.toggleHide);
  const currentBgType = useDashboardStore((state) => state.currentBgType);
  const countdowns = useDashboardStore((state) => state.countdowns);
  const [isCountdownsExpanded, setIsCountdownsExpanded] = useState(false);
  const isTimetableOpen = useDashboardStore((state) => state.isTimetableOpen);
  const setIsTimetableOpen = useDashboardStore((state) => state.setIsTimetableOpen);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === 'h') {
        e.preventDefault();
        toggleHide();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleHide]);

  useEffect(() => {
    // Show initial quote after 5 seconds of loading the dashboard
    const initialTimer = setTimeout(async () => {
      const q = await fetchQuote();
      showQuotePopup(q);
    }, 5000);

    // Then show a new quote every 30 minutes
    const interval = setInterval(async () => {
      const q = await fetchQuote();
      showQuotePopup(q);
    }, 30 * 60 * 1000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [showQuotePopup]);

  // Sync state across Chrome and Lively Wallpaper
  useEffect(() => {
    const syncState = () => {
      // Only pull from DB if user isn't actively typing in an input field.
      // This prevents typing overwrites while typing in Notes/Tasks, but ensures 
      // Lively Wallpaper ALWAYS polls reliably regardless of window focus state.
      const activeTag = document.activeElement?.tagName.toLowerCase();
      const isTyping = activeTag === 'input' || activeTag === 'textarea';

      if (!isTyping) {
        useDashboardStore.persist.rehydrate();
      }
    };

    // Check for updates every 3 seconds to keep Lively Wallpaper perfectly synced
    const syncInterval = setInterval(syncState, 3000);

    return () => clearInterval(syncInterval);
  }, []);

  return (
    <main className="relative overflow-hidden w-full flex-1">
      {/* Quote Popup */}
      {!isHidden && <QuotePopup />}

      {/* Stats Modal */}
      {!isHidden && <StatsModal />}

      {/* Quick Notes */}
      <NotesManager />

      {/* Roadmap & Plans */}
      {!isHidden && <PlansManager />}

      {/* Top Left: Background Switcher */}
      <div className="absolute top-6 left-4 z-50">
        <button
          onClick={useDashboardStore((state) => state.cycleBackground)}
          className="group flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-lg transition-all duration-300 hover:scale-110 hover:bg-white/20 hover:shadow-2xl"
          title="Switch Background"
        >
          <svg className="w-5 h-5 transition-transform duration-300 group-hover:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        </button>
      </div>

      {/* Top Leftish: Exam Countdowns */}
      {!isHidden && (
        <div className="absolute top-32 right-[320px] z-50 flex flex-col gap-4 items-center">
          {countdowns.length > 0 && (
            <Countdown key={countdowns[0].id} id={countdowns[0].id} />
          )}

          {isCountdownsExpanded && countdowns.slice(1).map(c => (
            <Countdown key={c.id} id={c.id} />
          ))}

          <button
            onClick={() => setIsCountdownsExpanded(!isCountdownsExpanded)}
            className="flex items-center justify-center p-1.5 text-white/40 hover:text-white bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full transition-all border border-white/10"
            title={isCountdownsExpanded ? "Hide extra targets" : "Show all targets"}
          >
            {isCountdownsExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
      )}

      {/* Top Right: Mini Calendar */}
      <div className="absolute top-6 right-4 z-50">
        <MiniCalendar />
      </div>

      {/* Dashboard components will be positioned absolutely within this container */}

      {/* BigClock */}
      <div className={`absolute z-0 transition-all duration-500 ${currentBgType === 'image' ? 'inset-0 flex items-start mt-40 justify-center' : 'top-40 left-10'}`}>
        <BigClock />
      </div>

      {/* Bottom Center (Above Dock): Timetable */}
      <div className="absolute bottom-40 left-1/2 -translate-x-1/2 z-300 flex flex-col items-center">
        {isTimetableOpen ? (
          <div className="flex flex-col items-center gap-2">
            <Timetable />
            <button
              onClick={() => setIsTimetableOpen(false)}
              className="bg-black/40 backdrop-blur-md border border-white/10 rounded-full px-2 py-2 text-white/60 hover:text-white hover:bg-black/60 transition-colors flex items-center gap-2 shadow-xl"
            >
              <ChevronDown size={16} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsTimetableOpen(true)}
            className="bg-black/20 backdrop-blur-md border border-white/10 rounded-full px-2 py-2 text-white/80 hover:text-white hover:bg-black/40 transition-colors flex items-center gap-2 shadow-xl hover:scale-105 pointer-events-auto"
          >
            <CalendarDays size={18} className="text-purple-400" />
          </button>
        )}
      </div>

      {/* Bottom Center: Dock */}
      <div className="absolute bottom-18 left-1/2 -translate-x-1/2 z-50">
        <Dock onOpenNotes={() => console.log('Open Notes clicked')} />
      </div>

      {/* Bottom Right: TaskManager & Timer */}
      <div className="absolute bottom-12 right-12 z-50 flex flex-col items-end gap-4">
        {!isHidden && <TaskManager />}
        <Timer />
      </div>
    </main>
  );
}
