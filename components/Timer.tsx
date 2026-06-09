'use client';
import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, VolumeX, Check, ListTodo, ChevronUp, ChevronDown, BarChart2, StickyNote, Map } from 'lucide-react';
import { useDashboardStore } from '@/store/dashboardStore';
import { fetchQuote } from '@/utils/quoteEngine';

export default function Timer() {
  const {
    timerTrigger, toggleTaskManager, isTaskManagerOpen,
    toggleStats, isStatsOpen,
    toggleNotes, isNotesOpen,
    togglePlans, isPlansOpen,
    timerEndAt, setTimerEndAt, 
    timerPausedLeft, setTimerPausedLeft,
    timerInitialMins, setTimerInitialMins,
    isAlarmPlaying, setIsAlarmPlaying,
    addMins,
    showQuotePopup, isHidden
  } = useDashboardStore();

  const [customMins, setCustomMins] = useState('');
  
  // Local state for UI updates (does not spam DB)
  const [localTimeLeft, setLocalTimeLeft] = useState(0);

  // Inline editing state
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [editHours, setEditHours] = useState('00');
  const [editMins, setEditMins] = useState('25');
  
  // Ensure local time immediately reflects store changes
  useEffect(() => {
    if (timerEndAt) {
      const remaining = Math.max(0, Math.floor((timerEndAt - Date.now()) / 1000));
      setLocalTimeLeft(remaining);
    } else if (timerPausedLeft !== null) {
      setLocalTimeLeft(timerPausedLeft);
    } else {
      setLocalTimeLeft(0);
    }
  }, [timerEndAt, timerPausedLeft]);

  // Main tick interval
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (timerEndAt) {
      interval = setInterval(() => {
        const now = Date.now();
        const remaining = Math.floor((timerEndAt - now) / 1000);

        if (remaining <= 0) {
          // Timer finished!
          setLocalTimeLeft(0);
          setTimerEndAt(null);
          setTimerPausedLeft(null);
          playAlarm();

          // Log to history
          if (timerInitialMins && timerInitialMins > 0) {
            const today = new Date().toISOString().split('T')[0];
            addMins(today, timerInitialMins);
            setTimerInitialMins(null); 
          }

          // Show quote popup
          fetchQuote().then(q => showQuotePopup(q));
        } else {
          setLocalTimeLeft(remaining);
        }
      }, 250); // High frequency check for smooth local UI update
    }

    return () => clearInterval(interval);
  }, [timerEndAt, timerInitialMins, addMins, setTimerEndAt, setTimerPausedLeft, setTimerInitialMins, showQuotePopup]);

  // Listen for timer triggers from other components
  useEffect(() => {
    if (timerTrigger) {
      startTimer(timerTrigger.mins * 60);
    }
  }, [timerTrigger]);

  const playAlarm = () => {
    setIsAlarmPlaying(true);
    setTimeout(() => {
      useDashboardStore.getState().setIsAlarmPlaying(false);
    }, 10000);
  };

  const stopAlarm = () => {
    setIsAlarmPlaying(false);
  };

  const startTimer = (seconds: number) => {
    setTimerInitialMins(Math.round(seconds / 60));
    setTimerPausedLeft(null);
    setTimerEndAt(Date.now() + seconds * 1000);
    stopAlarm();
  };

  const togglePause = () => {
    if (timerEndAt) {
      // Pause it
      setTimerPausedLeft(localTimeLeft);
      setTimerEndAt(null);
    } else if (timerPausedLeft !== null) {
      // Resume it
      setTimerEndAt(Date.now() + timerPausedLeft * 1000);
      setTimerPausedLeft(null);
    }
  };

  const resetTimer = () => {
    setTimerEndAt(null);
    setTimerPausedLeft(null);
    stopAlarm();
  };

  const handleCustomStart = () => {
    const mins = parseInt(customMins);
    if (!isNaN(mins) && mins > 0) {
      startTimer(mins * 60); // Fix: Custom input should be minutes, multiply by 60 for seconds
      setCustomMins('');
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) {
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const openEditor = () => {
    if (timerEndAt || isAlarmPlaying) return;
    const h = Math.floor(localTimeLeft / 3600);
    const m = Math.floor((localTimeLeft % 3600) / 60) || 25; 
    setEditHours(h.toString().padStart(2, '0'));
    setEditMins(m.toString().padStart(2, '0'));
    setIsEditingTime(true);
  };

  const saveEditor = () => {
    const h = parseInt(editHours) || 0;
    const m = parseInt(editMins) || 0;
    setTimerPausedLeft(h * 3600 + m * 60);
    setIsEditingTime(false);
  };

  const adjustEditTime = (type: 'h' | 'm', delta: number) => {
    if (type === 'h') {
      const h = Math.max(0, Math.min(99, parseInt(editHours) + delta));
      setEditHours(h.toString().padStart(2, '0'));
    } else {
      const m = Math.max(0, Math.min(59, parseInt(editMins) + delta));
      setEditMins(m.toString().padStart(2, '0'));
    }
  };

  return (
    <div className="relative pointer-events-auto">
      <div className="w-64 rounded-3xl bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl p-4 text-white flex flex-col gap-3">
        {/* Timer Display / Editor */}
        <div className="text-center min-h-[80px] flex items-center justify-center">
          {isEditingTime ? (
            <div className="flex items-center justify-center gap-2">
              <div className="flex flex-col items-center">
                <button onClick={() => adjustEditTime('h', 1)} className="hover:text-white/60 p-1"><ChevronUp size={20} /></button>
                <input
                  type="number"
                  value={editHours}
                  onChange={(e) => setEditHours(e.target.value.padStart(2, '0'))}
                  onKeyDown={(e) => e.key === 'Enter' && saveEditor()}
                  className="w-16 bg-transparent text-5xl font-light tabular-nums text-center outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none selection:bg-white/20"
                  min="0"
                  max="99"
                />
                <button onClick={() => adjustEditTime('h', -1)} className="hover:text-white/60 p-1"><ChevronDown size={20} /></button>
              </div>
              <span className="text-5xl font-light opacity-50 mb-0">:</span>
              <div className="flex flex-col items-center">
                <button onClick={() => adjustEditTime('m', 1)} className="hover:text-white/60 p-1"><ChevronUp size={20} /></button>
                <input
                  type="number"
                  value={editMins}
                  onChange={(e) => setEditMins(e.target.value.padStart(2, '0'))}
                  onKeyDown={(e) => e.key === 'Enter' && saveEditor()}
                  className="w-16 bg-transparent text-5xl font-light tabular-nums text-center outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none selection:bg-white/20"
                  min="0"
                  max="59"
                />
                <button onClick={() => adjustEditTime('m', -1)} className="hover:text-white/60 p-1"><ChevronDown size={20} /></button>
              </div>
              <button onClick={saveEditor} className="ml-1 p-2 bg-blue-500/80 hover:bg-blue-500 rounded-xl transition-colors">
                <Check size={20} />
              </button>
            </div>
          ) : (
            <div
              onClick={openEditor}
              className={`text-5xl font-light tracking-widest tabular-nums drop-shadow-md transition-opacity ${!timerEndAt && !isAlarmPlaying ? 'cursor-pointer hover:opacity-80' : ''}`}
              title={!timerEndAt && !isAlarmPlaying ? "Click to set time" : ""}
            >
              {formatTime(localTimeLeft)}
            </div>
          )}
        </div>

        {/* Alarm State */}
        {isAlarmPlaying ? (
          <button
            onClick={stopAlarm}
            className="w-full py-2 flex items-center justify-center gap-2 bg-red-500/80 hover:bg-red-500 rounded-xl font-medium transition-colors animate-pulse"
          >
            <VolumeX size={20} />
            STOP ALARM
          </button>
        ) : (
          <>
            {/* Controls */}
            {!isEditingTime && (
              <div className="flex justify-center gap-2">
                <button
                  onClick={localTimeLeft > 0 || timerPausedLeft ? togglePause : () => startTimer(25 * 60)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                  title={localTimeLeft > 0 || timerPausedLeft ? (timerEndAt ? "Pause" : "Resume") : "Start 25m Timer"}
                >
                  {timerEndAt ? <Pause size={20} /> : <Play size={20} />}
                </button>
                <button
                  onClick={resetTimer}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                  title="Reset Timer"
                >
                  <Square size={20} className="fill-current" />
                </button>
              </div>
            )}

            {/* Quick Presets & Custom */}
            {!timerEndAt && !timerPausedLeft && localTimeLeft === 0 && !isEditingTime && (
              <div className="flex flex-col gap-2 mt-1">
                <div className="flex justify-between gap-2">
                  {[5, 15, 25].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => startTimer(preset * 60)}
                      className="flex-1 py-1 text-sm bg-white/5 hover:bg-white/20 rounded-lg transition-colors border border-white/10 font-medium"
                    >
                      {preset}m
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Custom mins..."
                    value={customMins}
                    onChange={(e) => setCustomMins(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCustomStart()}
                    className="flex-1 min-w-0 bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-sm outline-none focus:bg-white/10 transition-colors placeholder:text-white/40 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    min="1"
                  />
                  <button
                    onClick={handleCustomStart}
                    className="px-3 py-1 bg-blue-500/60 hover:bg-blue-500/80 rounded-lg text-sm font-medium transition-colors shrink-0"
                  >
                    Set
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Hidden Audio Element */}
        {isAlarmPlaying && <audio src="/ringtones/alarm.mp3" loop autoPlay />}
      </div>

      {/* Right Side Control Buttons Group 
          You can easily adjust the margin/placement here!
          To move it down, remove `top-1/2 -translate-y-1/2` and use `bottom-0 mb-4` 
      */}
      <div className="absolute -right-14 top-1/2 -translate-y-1/2 mb-10 flex flex-col gap-3">
        {/* Plans Toggle Button */}
        {!isHidden && (
          <button
            onClick={togglePlans}
            className={`p-3 rounded-2xl border border-white/20 shadow-xl transition-all ${isPlansOpen ? 'bg-white/30 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white backdrop-blur-xl'}`}
            title="Roadmap & Plans"
          >
            <Map size={24} />
          </button>
        )}

        {/* Task Manager Toggle Button */}
        {!isHidden && (
          <button
            onClick={toggleTaskManager}
            className={`p-3 rounded-2xl border border-white/20 shadow-xl transition-all ${isTaskManagerOpen ? 'bg-white/30 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white backdrop-blur-xl'}`}
            title="Toggle Tasks"
          >
            <ListTodo size={24} />
          </button>
        )}

        {/* Stats Toggle Button */}
        {!isHidden && (
          <button
            onClick={toggleStats}
            className={`p-3 rounded-2xl border border-white/20 shadow-xl transition-all ${isStatsOpen ? 'bg-white/30 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white backdrop-blur-xl'}`}
            title="Focus History"
          >
            <BarChart2 size={24} />
          </button>
        )}

        {/* Notes Toggle Button */}
        <button
          onClick={toggleNotes}
          className={`p-3 rounded-2xl border border-white/20 shadow-xl transition-all ${isNotesOpen ? 'bg-white/30 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white backdrop-blur-xl'}`}
          title="Quick Notes"
        >
          <StickyNote size={24} />
        </button>
      </div>
    </div>
  );
}
