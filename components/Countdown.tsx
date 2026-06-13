"use client";

import { useState, useEffect } from "react";
import { useDashboardStore } from "@/store/dashboardStore";
import { Clock, Edit2, Check } from "lucide-react";
import { createPortal } from "react-dom";

import CustomDatePicker from "@/components/CustomDatePicker";

export default function Countdown({ id }: { id: string }) {
  const { countdowns, updateCountdown } = useDashboardStore();
  const examCountdown = countdowns.find(c => c.id === id) || { title: 'Target', endDate: null };

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });
  const [isEditing, setIsEditing] = useState(false);

  const [editTitle, setEditTitle] = useState(examCountdown.title);

  // Split into date and time for better browser compatibility
  const initialDate = examCountdown.endDate ? examCountdown.endDate.split('T')[0] : '';
  const initialTime = examCountdown.endDate && examCountdown.endDate.includes('T') ? examCountdown.endDate.split('T')[1] : '';

  const [editDateOnly, setEditDateOnly] = useState(initialDate);
  const [editTimeOnly, setEditTimeOnly] = useState(initialTime);

  useEffect(() => {
    if (!examCountdown.endDate) return;

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      let targetTime;

      const hasTime = examCountdown.endDate && examCountdown.endDate.includes('T') && examCountdown.endDate.split('T')[1] !== '';

      if (examCountdown.endDate && !hasTime) {
        // Parse 'YYYY-MM-DD' exactly as Local Midnight to prevent UTC timezone skew bugs
        const [y, m, d] = examCountdown.endDate.split('T')[0].split('-');
        targetTime = new Date(Number(y), Number(m) - 1, Number(d), 0, 0, 0).getTime();
      } else {
        targetTime = new Date(examCountdown.endDate!).getTime();
      }

      const distance = targetTime - now;

      if (distance < 0 || isNaN(distance)) {
        setTimeLeft({ days: 0, hours: 0, mins: 0, secs: 0 });
        return false; // stop interval
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        mins: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        secs: Math.floor((distance % (1000 * 60)) / 1000)
      });
      return true;
    };

    // Run immediately once
    const shouldContinue = calculateTimeLeft();
    if (!shouldContinue) return;

    const interval = setInterval(() => {
      const keepGoing = calculateTimeLeft();
      if (!keepGoing) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, [examCountdown.endDate]);

  const handleSave = () => {
    // Combine date and time (omit time if not provided)
    const finalDateTime = editDateOnly ? (editTimeOnly ? `${editDateOnly}T${editTimeOnly}` : editDateOnly) : null;
    updateCountdown(id, editTitle, finalDateTime);
    setIsEditing(false);
  };

  const hasTime = examCountdown.endDate && examCountdown.endDate.includes('T') && examCountdown.endDate.split('T')[1] !== '';

  return (
    <div className="bg-black/20 backdrop-blur-2xl border border-white/10 rounded-3xl p-3 shadow-2xl w-80 pointer-events-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-white/80 cursor-grab active:cursor-grabbing">
          <Clock size={18} className="text-blue-400" />
          <span className="font-semibold tracking-wide uppercase text-sm">
            {isEditing ? "Edit Target" : examCountdown.title}
          </span>
        </div>
        <button
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          className={`p-2 rounded-xl transition-all border ${isEditing ? 'bg-green-500/10 border-green-500/30 hover:bg-green-500/20 hover:border-green-500/50' : 'bg-white/5 border-white/10 hover:bg-white/15 hover:border-white/20'}`}
          title={isEditing ? "Save Target" : "Edit Target"}
        >
          {isEditing ? <Check size={20} className="text-green-400 drop-shadow-[0_0_5px_rgba(74,222,128,0.5)]" /> : <Edit2 size={18} className="text-white/80" />}
        </button>
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-white/30 text-sm"
            placeholder="Target Title"
          />
          <div className="flex gap-2 relative items-stretch">
            <div className="flex-1">
              <CustomDatePicker value={editDateOnly} onChange={setEditDateOnly} />
            </div>
            <div className="w-28 shrink-0">
              <CustomTimePicker value={editTimeOnly} onChange={setEditTimeOnly} />
            </div>
          </div>
        </div>
      ) : hasTime ? (
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-white/5 rounded-2xl py-3 border border-white/5">
            <div className="text-3xl font-bold text-white">{String(timeLeft.days).padStart(2, '0')}</div>
            <div className="text-[10px] text-white/50 uppercase tracking-widest mt-1">Days</div>
          </div>
          <div className="bg-white/5 rounded-2xl py-3 border border-white/5">
            <div className="text-3xl font-bold text-white">{String(timeLeft.hours).padStart(2, '0')}</div>
            <div className="text-[10px] text-white/50 uppercase tracking-widest mt-1">Hrs</div>
          </div>
          <div className="bg-white/5 rounded-2xl py-3 border border-white/5">
            <div className="text-3xl font-bold text-white">{String(timeLeft.mins).padStart(2, '0')}</div>
            <div className="text-[10px] text-white/50 uppercase tracking-widest mt-1">Min</div>
          </div>
        </div>
      ) : (
        <div className="bg-white/5 rounded-2xl py-4 border border-white/5 text-center flex flex-col items-center justify-center">
          <div className="text-5xl font-bold text-white">{String(timeLeft.days).padStart(2, '0')}</div>
          <div className="text-xs text-white/50 uppercase tracking-widest mt-2">Days Remaining</div>
        </div>
      )}
    </div>
  );
}

function CustomTimePicker({ value, onChange }: { value: string, onChange: (time: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempTime, setTempTime] = useState(value);

  // Sync tempTime when opened
  useEffect(() => {
    if (isOpen) setTempTime(value);
  }, [isOpen, value]);

  return (
    <>
      <div 
        onClick={() => setIsOpen(true)}
        className="w-full h-full bg-black/40 border border-white/10 rounded-xl px-3 text-white cursor-pointer hover:border-blue-500 transition-colors text-sm text-center flex items-center justify-center min-h-[42px]"
      >
        <span className={value ? "text-white" : "text-white/40"}>{value || "Time"}</span>
      </div>

      {isOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center pointer-events-auto">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <div className="relative bg-gray-900 border border-white/20 rounded-3xl p-6 z-10 w-72 animate-in zoom-in-95 shadow-2xl">
            <h3 className="text-white text-center font-medium mb-4 tracking-wide">Target Time <span className="text-white/30 text-xs font-normal">(Optional)</span></h3>
            
            <input 
              type="time" 
              value={tempTime} 
              onChange={e => setTempTime(e.target.value)} 
              className="w-full bg-black/40 text-white rounded-xl px-4 py-4 border border-white/10 outline-none focus:border-blue-500 mb-6 [color-scheme:dark] text-2xl text-center shadow-inner" 
            />
            
            <div className="flex gap-3">
              <button 
                onClick={() => { onChange(''); setIsOpen(false); }} 
                className="flex-1 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-sm font-medium transition-colors"
              >
                Clear
              </button>
              <button 
                onClick={() => { onChange(tempTime); setIsOpen(false); }} 
                className="flex-[2] py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-medium transition-colors shadow-lg shadow-blue-500/20"
              >
                Save
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
