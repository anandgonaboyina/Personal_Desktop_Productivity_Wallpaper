'use client';

import { useEffect, useState } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { Flame } from 'lucide-react';

export default function BigClock() {
  const [time, setTime] = useState<Date | null>(null);
  const history = useDashboardStore((state) => state.history);
  const toggleHide = useDashboardStore((state) => state.toggleHide);
  const currentBgType = useDashboardStore((state) => state.currentBgType);
  const isTimetableOpen = useDashboardStore((state) => state.isTimetableOpen);
  const is24HourClock = useDashboardStore((state) => state.is24HourClock);
  const toggle24HourClock = useDashboardStore((state) => state.toggle24HourClock);

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
      <div className={`flex flex-col justify-center pointer-events-none opacity-0 ${currentBgType === 'image' ? 'items-center' : 'items-start'}`}>
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

  const today = new Date().toISOString().split('T')[0];
  const todayMins = history[today] || 0;
  const focusHours = Math.floor(todayMins / 60);
  const focusMins = todayMins % 60;

  // Format "Xh Ym" or just "Ym" if no hours
  const focusText = focusHours > 0 ? `${focusHours}h ${focusMins}m` : `${focusMins}m`;

  return (
    <div className={`flex flex-col justify-center pointer-events-none drop-shadow-2xl transition-all duration-500 ${currentBgType === 'image' ? 'items-center' : 'items-start'} ${currentBgType === 'image' && isTimetableOpen ? '-translate-y-8' : ''}`}>
      <div
        onClick={toggle24HourClock}
        className={`${currentBgType === 'image' ? (isTimetableOpen ? 'text-[5rem]' : 'text-[12rem]') : 'text-[12rem]'} font-bold leading-none tracking-tighter text-white/90 pointer-events-auto cursor-pointer hover:text-white transition-all duration-500`}
        title="Toggle 12/24 Hour Format"
      >
        {hours}:{minutes}
      </div>
      <div className={`${currentBgType === 'image' && isTimetableOpen ? 'text-2xl' : 'text-5xl'} font-semibold tracking-widest text-white/60 uppercase mt-1 transition-all duration-500`}>
        {seconds} {!is24HourClock && <span className="text-white/40 ml-2">{ampm}</span>}
      </div>

      {/* Today's Focus History */}
      <div
        onClick={toggleHide}
        title="Toggle Hidden Mode (Ctrl+H)"
        className={`flex items-center gap-2 text-white/60 font-medium tracking-wide bg-black/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 shadow-xl cursor-pointer pointer-events-auto hover:bg-black/40 transition-all duration-500 ${currentBgType === 'image' && isTimetableOpen ? 'text-sm mt-0 scale-75 origin-top' : 'text-lg mt-1'}`}
      >
        <Flame size={20} className="text-orange-400" />
        Today: <span className="text-white/90 font-bold">{focusText}</span>
      </div>
    </div>
  );
}
