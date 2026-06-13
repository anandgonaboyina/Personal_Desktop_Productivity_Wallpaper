'use client';
import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, VolumeX, Check, ListTodo, ChevronUp, ChevronDown, BarChart2, StickyNote, Map, Settings } from 'lucide-react';
import { useDashboardStore } from '@/store/dashboardStore';
import { fetchQuote } from '@/utils/quoteEngine';
import { getLocalDateString } from '@/utils/date';
import DraggableWidget from './DraggableWidget';

export default function Timer() {
  const {
    timerTrigger, toggleTaskManager, isTaskManagerOpen,
    toggleStats, isStatsOpen,
    toggleNotes, isNotesOpen,
    togglePlans, isPlansOpen,
    timerEndAt, setTimerEndAt,
    timerPausedLeft, setTimerPausedLeft,
    timerInitialMins, setTimerInitialMins,
    timerLastSavedChunks, setTimerLastSavedChunks,
    isAlarmPlaying, setIsAlarmPlaying,
    addMins,
    showQuotePopup, isHidden,
    activeTaskId, activeTaskTitle, setActiveTask, updateTaskDuration,
    alarmSound, alarmVolume
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

  // Helper to save partial time for an active task timer before clearing/overwriting it
  const saveAndClearActiveTaskTimer = () => {
    if (activeTaskId && timerInitialMins) {
      let currentRemaining = localTimeLeft;
      if (timerEndAt) {
        currentRemaining = Math.max(0, Math.floor((timerEndAt - Date.now()) / 1000));
      } else if (timerPausedLeft !== null) {
        currentRemaining = timerPausedLeft;
      }

      const elapsedSeconds = (timerInitialMins * 60) - currentRemaining;
      if (elapsedSeconds > 0) {
        const finalUnsavedSeconds = elapsedSeconds - (timerLastSavedChunks * 600);
        const finalUnsavedMins = Math.round(finalUnsavedSeconds / 60);

        if (finalUnsavedMins > 0) {
          const today = getLocalDateString();
          addMins(today, finalUnsavedMins);
          updateTaskDuration(activeTaskId, finalUnsavedMins);
        }
      }
    }

    setActiveTask(null, null);
    setTimerLastSavedChunks(0);
  };

  // Main tick interval
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (timerEndAt) {
      interval = setInterval(() => {
        const now = Date.now();
        const remaining = Math.floor((timerEndAt - now) / 1000);

        if (timerInitialMins && activeTaskId) {
          const elapsedSeconds = (timerInitialMins * 60) - remaining;
          if (elapsedSeconds >= 0) {
            const chunks = Math.floor(elapsedSeconds / 600); // 10 minutes = 600 seconds
            if (chunks > timerLastSavedChunks) {
              const diff = chunks - timerLastSavedChunks;
              const minsToSave = diff * 10;
              const today = getLocalDateString();
              addMins(today, minsToSave);
              updateTaskDuration(activeTaskId, minsToSave);
              setTimerLastSavedChunks(chunks);
            }
          }
        }

        if (remaining <= 0) {
          // Timer finished!
          clearInterval(interval);
          setLocalTimeLeft(0);
          setTimerEndAt(null);
          setTimerPausedLeft(null);
          playAlarm();

          // Log to history
          if (timerInitialMins && timerInitialMins > 0) {
            const today = getLocalDateString();
            if (activeTaskId) {
              const elapsedSeconds = timerInitialMins * 60;
              const finalUnsavedSeconds = elapsedSeconds - (timerLastSavedChunks * 600);
              const finalUnsavedMins = Math.round(finalUnsavedSeconds / 60);
              if (finalUnsavedMins > 0) {
                addMins(today, finalUnsavedMins);
                updateTaskDuration(activeTaskId, finalUnsavedMins);
              }
              setActiveTask(null, null);
              setTimerLastSavedChunks(0);
            } else {
              addMins(today, timerInitialMins);
            }
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
  }, [timerEndAt, timerInitialMins, timerLastSavedChunks, addMins, setTimerEndAt, setTimerPausedLeft, setTimerInitialMins, setTimerLastSavedChunks, showQuotePopup, activeTaskId, updateTaskDuration, setActiveTask]);

  // Listen for timer triggers from other components
  useEffect(() => {
    if (timerTrigger) {
      const state = useDashboardStore.getState();
      if (timerTrigger.taskId && timerTrigger.taskId === state.activeTaskId) {
        if (state.timerPausedLeft !== null) {
          setTimerEndAt(Date.now() + state.timerPausedLeft * 1000);
          setTimerPausedLeft(null);
        }
        return;
      }

      // If we are triggering a new timer, save partial time of any currently running task timer
      saveAndClearActiveTaskTimer();

      if (timerTrigger.taskId) {
        setActiveTask(timerTrigger.taskId, timerTrigger.taskTitle || null);
        startTimer(timerTrigger.mins * 60, true);
      } else {
        startTimer(timerTrigger.mins * 60, false);
      }
    }
  }, [timerTrigger]);

  const playAlarm = () => {
    setIsAlarmPlaying(true);
    const durationSecs = useDashboardStore.getState().alarmDurationSecs || 60;
    setTimeout(() => {
      useDashboardStore.getState().setIsAlarmPlaying(false);
    }, durationSecs * 1000);
  };

  const stopAlarm = () => {
    setIsAlarmPlaying(false);
  };

  const startTimer = (seconds: number, isTask: boolean = false) => {
    if (!isTask) {
      saveAndClearActiveTaskTimer();
    }
    setTimerInitialMins(Math.round(seconds / 60));
    setTimerPausedLeft(null);
    setTimerEndAt(Date.now() + seconds * 1000);
    setTimerLastSavedChunks(0);
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
    saveAndClearActiveTaskTimer();
    setTimerEndAt(null);
    setTimerPausedLeft(null);
    setTimerInitialMins(null);
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
    const newRemaining = h * 3600 + m * 60;

    if (timerInitialMins) {
      const oldElapsed = (timerInitialMins * 60) - localTimeLeft;
      setTimerInitialMins(Math.max(0, Math.round((oldElapsed + newRemaining) / 60)));
    }

    setTimerPausedLeft(newRemaining);
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
    <DraggableWidget id="timer">
    <div className="relative pointer-events-auto select-none">
      <div className="w-64 rounded-3xl bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl p-3 text-white flex flex-col gap-2">
        {/* Timer Display / Editor */}
        <div className="text-center min-h-[80px] flex flex-col items-center justify-center relative">
          {activeTaskTitle && (
            <div className="w-full max-w-[220px] mb-3 text-sm font-bold text-white flex items-center justify-center gap-2 bg-blue-600/50 backdrop-blur-md border border-blue-400/50 px-2 py-2 rounded-2xl shadow-[0_0_15px_rgba(59,130,246,0.3)]">
              <span className="shrink-0 w-2 h-2 rounded-full bg-blue-200 animate-pulse mt-[5px] self-start"></span>
              <span className="break-words whitespace-normal text-center leading-snug drop-shadow-md">{activeTaskTitle}</span>
            </div>
          )}
          <div className="flex items-center justify-center w-full relative">
            {/* Quick Presets Right */}
            {!timerEndAt && !timerPausedLeft && localTimeLeft === 0 && !isEditingTime && (
              <div className="absolute right-1 top-1/2 mt-[20px] ml-[5px] -translate-y-1/2 flex flex-col gap-1.5">
                {[5, 15, 25].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => startTimer(preset * 60)}
                    className="w-10 py-1 text-xs bg-white/5 hover:bg-white/20 rounded-lg transition-colors border border-white/10 font-medium"
                  >
                    {preset}m
                  </button>
                ))}
              </div>
            )}

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

            {/* Custom Input */}
            {!timerEndAt && !timerPausedLeft && localTimeLeft === 0 && !isEditingTime && (
              <div className="flex gap-2 mt-1">
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
            )}
          </>
        )}

        {/* Hidden Audio Element */}
        {isAlarmPlaying && <audio src={alarmSound} loop autoPlay />}
      </div>
    </div>
    </DraggableWidget>
  );
}
