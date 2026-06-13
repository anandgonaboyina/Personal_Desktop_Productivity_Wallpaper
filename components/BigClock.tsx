'use client';

import { useEffect, useState } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { Flame } from 'lucide-react';
import { getLocalDateString } from '@/utils/date';

export default function BigClock() {
  const [time, setTime] = useState<Date | null>(null);
  const history = useDashboardStore((state) => state.history);
  const toggleHide = useDashboardStore((state) => state.toggleHide);
  const currentBgType = useDashboardStore((state) => state.currentBgType);
  const isTimetableOpen = useDashboardStore((state) => state.isTimetableOpen);
  const is24HourClock = useDashboardStore((state) => state.is24HourClock);
  const toggle24HourClock = useDashboardStore((state) => state.toggle24HourClock);
  const showClock = useDashboardStore((state) => state.showClock);
  const showTodayWork = useDashboardStore((state) => state.showTodayWork);

  useEffect(() => {
    // Initial set
    setTime(new Date());

    // Update every second
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Avoid hydration mismatch by not rendering until mounted
  if (!time) {
    return (
      <div className={`flex flex-col justify-center pointer-events-none opacity-0 items-center`}>
        <div className="text-[12rem] font-bold leading-none tracking-tighter">00:00</div>
      </div>
    );
  }

  // Format the time
  const rawHours = time.getHours();
  const displayHours = is24HourClock ? rawHours : (rawHours % 12 || 12);
  const hours = displayHours.toString().padStart(2, '0');

  const minutes = time.getMinutes().toString().padStart(2, '0');
  const seconds = time.getSeconds().toString().padStart(2, '0');
  const ampm = rawHours >= 12 ? 'PM' : 'AM';

  const today = getLocalDateString();
  const todayMins = history[today] || 0;
  const focusHours = Math.floor(todayMins / 60);
  const focusMins = todayMins % 60;

  // Format "Xh Ym" or just "Ym" if no hours
  const focusText = focusHours > 0 ? `${focusHours}h ${focusMins}m` : `${focusMins}m`;

  // Time left today
  const eod = new Date(time);
  eod.setHours(23, 59, 59, 999);
  const msLeft = eod.getTime() - time.getTime();
  const hrsLeft = Math.floor(msLeft / (1000 * 60 * 60));
  const minsLeft = Math.floor((msLeft % (1000 * 60 * 60)) / (1000 * 60));
  const timeLeftText = hrsLeft > 0 ? `${hrsLeft}h left` : `${minsLeft}m left`;

  return (
    <div className={`flex flex-col justify-center pointer-events-none drop-shadow-2xl transition-all duration-500 items-center ${currentBgType === 'image' && isTimetableOpen ? '-translate-y-8' : ''}`}>
      {showClock && (
        <>
          <div
            onClick={toggle24HourClock}
            className={`${currentBgType === 'image' ? (isTimetableOpen ? 'text-[5rem]' : 'text-[12rem]') : 'text-[12rem]'} font-bold leading-none tracking-tighter pointer-events-auto cursor-pointer transition-all duration-500 text-transparent bg-clip-text bg-gradient-to-b from-white/90 via-white/50 to-white/10 [-webkit-text-stroke:1.5px_rgba(255,255,255,0.5)] drop-shadow-[0_30px_40px_rgba(0,0,0,0.8)] drop-shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:from-white hover:to-white/40`}
            title="Toggle 12/24 Hour Format"
          >
            {hours}:{minutes}
          </div>
          <div className={`${currentBgType === 'image' && isTimetableOpen ? 'text-2xl' : 'text-5xl'} font-semibold tracking-widest uppercase mt-1 transition-all duration-500 flex items-baseline`}>
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white/90 to-white/30 [-webkit-text-stroke:1px_rgba(255,255,255,0.4)] drop-shadow-[0_15px_20px_rgba(0,0,0,0.7)]">{seconds}</span>
            {!is24HourClock && <span className="text-white/40 ml-2 [-webkit-text-stroke:0px]">{ampm}</span>}
          </div>
        </>
      )}

      {/* Today's Focus History */}
      {showTodayWork && (
        <div
          onClick={toggleHide}
          title="Toggle Hidden Mode (Ctrl+H)"
          className={`flex items-center gap-2 text-white/60 font-medium tracking-wide bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 shadow-xl cursor-pointer pointer-events-auto hover:bg-black/40 transition-all duration-500 ${currentBgType === 'image' && isTimetableOpen ? 'text-sm mt-0 scale-75 origin-top' : 'text-lg mt-1'}`}
        >
          <Flame size={20} className="text-orange-400" />
          <span>Today: <span className="text-white/90 font-bold">{focusText}</span></span>
          <span className="text-white/30 mx-1">|</span>
          <span className="text-white/80">{timeLeftText}</span>
        </div>
      )}
    </div>
  );
}
