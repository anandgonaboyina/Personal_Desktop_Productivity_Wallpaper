"use client";

import { useState, useEffect } from "react";
import { useDashboardStore } from "@/store/dashboardStore";
import { Clock, Edit2, Check } from "lucide-react";

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
      const distance = new Date(examCountdown.endDate!).getTime() - now;

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
    // Combine date and time (default to 00:00 if no time provided)
    const finalDateTime = editDateOnly ? `${editDateOnly}T${editTimeOnly || '00:00'}` : null;
    updateCountdown(id, editTitle, finalDateTime);
    setIsEditing(false);
  };

  return (
    <div className="bg-black/20 backdrop-blur-2xl border border-white/10 rounded-3xl p-3 shadow-2xl w-80 pointer-events-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-white/80">
          <Clock size={18} className="text-blue-400" />
          <span className="font-semibold tracking-wide uppercase text-sm">
            {isEditing ? "Edit Target" : examCountdown.title}
          </span>
        </div>
        <button
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          className="text-white/40 hover:text-white transition-colors"
        >
          {isEditing ? <Check size={16} className="text-green-400" /> : <Edit2 size={16} />}
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
          <div className="flex gap-2 relative">
            <div className="flex-[3]">
              <CustomDatePicker value={editDateOnly} onChange={setEditDateOnly} />
            </div>
            <div className="flex-[2]">
              <input
                type="time"
                value={editTimeOnly}
                onChange={(e) => setEditTimeOnly(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-blue-500 transition-colors text-sm [color-scheme:dark]"
              />
            </div>
          </div>
        </div>
      ) : (
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
      )}
    </div>
  );
}
