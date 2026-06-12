import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Task {
  id: string;
  title: string;
  duration: number; // in minutes
  completed: boolean;
}

export interface Note {
  id: string;
  title: string;
  entries: Record<string, string>; // date string -> html content
}

export interface SubTopic {
  id: string;
  title: string;
  completed: boolean;
}

export interface Plan {
  id: string;
  title: string;
  category: string;
  duration: string;
  endDate: string;
  thumbnailBase64: string; // aggressively compressed data URL
  subTopics: SubTopic[];
}

export interface HealthData {
  water: number;
  stretch: number;
  reading: number;
  academic: number;
  english: number;
}

export type TimetableGrid = Record<string, Record<string, string>>;

interface DashboardState {
  wallpaper: string;
  bgIndex: number;
  currentBgType: 'image' | 'video' | null;
  cycleBackground: () => void;
  setCurrentBgType: (type: 'image' | 'video' | null) => void;
  isVideoMuted: boolean;
  setIsVideoMuted: (muted: boolean) => void;
  isVideoPlaying: boolean;
  setIsVideoPlaying: (playing: boolean) => void;
  history: Record<string, number>;
  tasks: Task[];
  isHidden: boolean;
  lockedWallpaper: string | null;
  setLockedWallpaper: (filename: string | null) => void;
  setWallpaper: (url: string) => void;
  addMins: (dateKey: string, mins: number) => void;
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  toggleHide: () => void;

  isTaskManagerOpen: boolean;
  toggleTaskManager: () => void;
  isStatsOpen: boolean;
  toggleStats: () => void;
  isSettingsOpen: boolean;
  toggleSettings: () => void;
  timerTrigger: { mins: number; ts: number; taskId?: string; taskTitle?: string } | null;
  triggerTimer: (mins: number, taskId?: string, taskTitle?: string) => void;

  // Active Task for Timer
  activeTaskId: string | null;
  activeTaskTitle: string | null;
  setActiveTask: (id: string | null, title: string | null) => void;
  updateTaskDuration: (id: string, decreaseMins: number) => void;
  editTaskDuration: (id: string, newDuration: number) => void;

  // Global Timer State
  timerEndAt: number | null;
  timerPausedLeft: number | null; // Keeps track of remaining time if paused
  timerInitialMins: number | null;
  timerLastSavedChunks: number;
  isAlarmPlaying: boolean;
  setTimerEndAt: (time: number | null) => void;
  setTimerPausedLeft: (time: number | null) => void;
  setTimerInitialMins: (mins: number | null) => void;
  setTimerLastSavedChunks: (chunks: number) => void;
  setIsAlarmPlaying: (playing: boolean) => void;

  // Quotes State
  currentQuote: { text: string; author: string } | null;
  isQuotePopupOpen: boolean;
  showQuotePopup: (quote: { text: string; author: string }) => void;
  hideQuotePopup: () => void;

  // Notes State
  notes: Note[];
  activeNoteId: string | null;
  isNotesOpen: boolean;
  addNote: () => void;
  updateNoteTitle: (id: string, title: string) => void;
  updateNoteEntry: (id: string, date: string, content: string) => void;
  deleteNote: (id: string) => void;
  setActiveNote: (id: string) => void;
  toggleNotes: () => void;

  // Plans/Roadmap State
  plans: Plan[];
  isPlansOpen: boolean;
  togglePlans: () => void;
  addPlan: (plan: Plan) => void;
  updatePlanDetails: (id: string, duration: string, endDate: string) => void;
  deletePlan: (id: string) => void;
  addSubTopic: (planId: string, title: string) => void;
  toggleSubTopic: (planId: string, subTopicId: string) => void;
  deleteSubTopic: (planId: string, subTopicId: string) => void;

  // Clock Format
  is24HourClock: boolean;
  toggle24HourClock: () => void;

  // Countdowns
  countdowns: { id: string; title: string; endDate: string | null }[];
  updateCountdown: (id: string, title: string, endDate: string | null) => void;

  // Timetable
  timetableGrid: TimetableGrid;
  updateTimetableCell: (day: string, time: string, subject: string) => void;
  isTimetableOpen: boolean;
  setIsTimetableOpen: (isOpen: boolean) => void;

  // Health Rings
  healthData: Record<string, HealthData>;
  fetchHealthData: () => Promise<void>;
  updateHealth: (dateKey: string, type: keyof HealthData, value: number) => void;
  isHealthModalOpen: boolean;
  toggleHealthModal: () => void;

  clockOffsets: Record<string, { x: number, y: number }>;
  updateClockOffset: (bgSrc: string, x: number, y: number) => void;
  resetClockOffset: (bgSrc: string) => void;

  widgetOffsets: Record<string, Record<string, { x: number, y: number }>>;
  updateWidgetOffset: (bgSrc: string, widgetId: string, x: number, y: number) => void;
  resetWidgetOffset: (bgSrc: string, widgetId: string) => void;
  
  lockedWidgets: string[];
  toggleWidgetLock: (widgetId: string) => void;
  resetAllOffsets: (bgSrc: string) => void;

  currentBgSrc: string | null;
  setCurrentBgSrc: (src: string | null) => void;
  
  hiddenWallpapers: string[];
  toggleWallpaperVisibility: (filename: string) => void;

  // Slideshow
  isSlideshowEnabled: boolean;
  setIsSlideshowEnabled: (enabled: boolean) => void;
  slideshowIntervalMins: number;
  setSlideshowIntervalMins: (mins: number) => void;

  // Support
  upiId: string;
  setUpiId: (id: string) => void;

  // Widget Visibility Preferences
  showHealth: boolean;
  showQuote: boolean;
  showTimer: boolean;
  showCountdowns: boolean;
  showVideoControls: boolean;
  showClock: boolean;
  showTasks: boolean;
  showCalendar: boolean;
  showTodayWork: boolean;
  toggleVisibility: (key: 'showHealth' | 'showQuote' | 'showTimer' | 'showCountdowns' | 'showVideoControls' | 'showClock' | 'showTasks' | 'showCalendar' | 'showTodayWork') => void;

  clearOldData: (days: number) => Promise<void>;
  clearAllData: () => Promise<void>;
}

// ---------------------------------------------------------------------------
// Persistent storage: writes to a JSON file on disk via /api/store so that
// data survives PC reboots in Lively Wallpaper (WebView2 wipes localStorage).
// Falls back to localStorage when the API is unavailable (e.g. offline dev).
// ---------------------------------------------------------------------------
const getActiveProfileId = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('dashboard-active-profile') || '1';
  }
  return '1';
};

const fileStorage = createJSONStorage(() => ({
  getItem: async (_name: string): Promise<string | null> => {
    try {
      const res = await fetch(`/api/store?profileId=${getActiveProfileId()}`, { cache: 'no-store' });
      if (!res.ok) throw new Error('API error');
      const json = await res.json();
      
      // If the API returns explicitly null data (new profile), we MUST return null 
      // so Zustand starts from the default empty state, instead of falling back to old localStorage.
      if (json.data === null) return null;
      if (json.data) return JSON.stringify(json.data);
    } catch {
      // Fall back to localStorage only if API is completely offline
    }
    return localStorage.getItem(`dashboard-storage-${getActiveProfileId()}`);
  },
  setItem: async (_name: string, value: string): Promise<void> => {
    try {
      await fetch('/api/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileId: getActiveProfileId(), data: JSON.parse(value) }),
      });
    } catch {
      // Only write to localStorage if API fails to prevent infinite cross-tab storage event loops
      localStorage.setItem(`dashboard-storage-${getActiveProfileId()}`, value);
    }
  },
  removeItem: async (_name: string): Promise<void> => {
    try {
      await fetch('/api/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileId: getActiveProfileId(), data: null }),
      });
    } catch { 
      localStorage.removeItem(`dashboard-storage-${getActiveProfileId()}`);
    }
  },
}));

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
      wallpaper: '/wallpaper.webp',
      bgIndex: 0,
      currentBgType: null,
      lockedWallpaper: null,
      history: {},
      tasks: [],
      isHidden: false,

      setLockedWallpaper: (filename) => set({ lockedWallpaper: filename }),
      setWallpaper: (url) => set({ wallpaper: url }),
      cycleBackground: () => set((state) => ({ lockedWallpaper: null, bgIndex: state.bgIndex + 1 })),
      setCurrentBgType: (type) => set({ currentBgType: type }),
      currentBgSrc: null,
      setCurrentBgSrc: (src) => set({ currentBgSrc: src }),
      isVideoMuted: true,
      setIsVideoMuted: (muted) => set({ isVideoMuted: muted }),
      isVideoPlaying: true,
      setIsVideoPlaying: (playing) => set({ isVideoPlaying: playing }),

      addMins: (dateKey, mins) =>
        set((state) => ({
          history: {
            ...state.history,
            [dateKey]: (state.history[dateKey] || 0) + mins,
          },
        })),

      setTasks: (tasks) => set({ tasks }),

      addTask: (task) =>
        set((state) => ({
          tasks: [...state.tasks, task],
        })),

      toggleTask: (id) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, completed: !t.completed } : t
          ),
        })),

      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
        })),

      toggleHide: () => set((state) => ({ isHidden: !state.isHidden })),

      isTaskManagerOpen: false,
      toggleTaskManager: () => set((state) => ({ isTaskManagerOpen: !state.isTaskManagerOpen })),
      isStatsOpen: false,
      toggleStats: () => set((state) => ({ isStatsOpen: !state.isStatsOpen })),
      isSettingsOpen: false,
      toggleSettings: () => set((state) => ({ isSettingsOpen: !state.isSettingsOpen })),
      timerTrigger: null,
      triggerTimer: (mins, taskId, taskTitle) => set({ timerTrigger: { mins, ts: Date.now(), taskId, taskTitle } }),

      activeTaskId: null,
      activeTaskTitle: null,
      setActiveTask: (id, title) => set({ activeTaskId: id, activeTaskTitle: title }),
      updateTaskDuration: (id, decreaseMins) => set((state) => ({
        tasks: state.tasks.map(t => t.id === id ? { ...t, duration: Math.max(0, t.duration - decreaseMins) } : t)
      })),
      editTaskDuration: (id, newDuration) => set((state) => ({
        tasks: state.tasks.map(t => t.id === id ? { ...t, duration: Math.max(0, newDuration) } : t)
      })),

      timerEndAt: null,
      timerPausedLeft: null,
      timerInitialMins: null,
      timerLastSavedChunks: 0,
      isAlarmPlaying: false,
      setTimerEndAt: (time) => set({ timerEndAt: time }),
      setTimerPausedLeft: (time) => set({ timerPausedLeft: time }),
      setTimerInitialMins: (mins) => set({ timerInitialMins: mins }),
      setTimerLastSavedChunks: (chunks) => set({ timerLastSavedChunks: chunks }),
      setIsAlarmPlaying: (playing) => set({ isAlarmPlaying: playing }),

      currentQuote: null,
      isQuotePopupOpen: false,
      showQuotePopup: (quote) => set({ currentQuote: quote, isQuotePopupOpen: true }),
      hideQuotePopup: () => set({ isQuotePopupOpen: false }),

      // Notes State
      notes: [{ id: 'default', title: 'Daily Journal', entries: {} }],
      activeNoteId: 'default',
      isNotesOpen: false,
      addNote: () => {
        const newNote = { id: Date.now().toString(), title: 'New Note', entries: {} };
        set((state) => ({ notes: [newNote, ...state.notes], activeNoteId: newNote.id }));
      },
      updateNoteTitle: (id, title) => set((state) => ({
        notes: state.notes.map(n => n.id === id ? { ...n, title } : n)
      })),
      updateNoteEntry: (id, date, content) => set((state) => {
        return {
          notes: state.notes.map(n => {
            if (n.id !== id) return n;
            const newEntries = { ...n.entries };
            const cleanText = content.replace(/<[^>]*>?/gm, '').trim();
            if (!cleanText) {
              delete newEntries[date];
            } else {
              newEntries[date] = content;
            }
            return { ...n, entries: newEntries };
          })
        };
      }),
      deleteNote: (id) => set((state) => {
        const newNotes = state.notes.filter(n => n.id !== id);
        if (newNotes.length === 0) {
          const defaultNote = { id: Date.now().toString(), title: 'Daily Journal', entries: {} };
          return { notes: [defaultNote], activeNoteId: defaultNote.id };
        }
        return { 
          notes: newNotes, 
          activeNoteId: state.activeNoteId === id ? newNotes[0].id : state.activeNoteId 
        };
      }),
      setActiveNote: (id) => set({ activeNoteId: id }),
      toggleNotes: () => set((state) => ({ isNotesOpen: !state.isNotesOpen })),

      // Plans State
      plans: [],
      isPlansOpen: false,
      togglePlans: () => set((state) => ({ isPlansOpen: !state.isPlansOpen })),
      addPlan: (plan) => set((state) => ({ plans: [...state.plans, plan] })),
      updatePlanDetails: (id, duration, endDate) => set((state) => ({
        plans: state.plans.map(p => p.id === id ? { ...p, duration, endDate } : p)
      })),
      deletePlan: (id) => set((state) => ({ plans: state.plans.filter(p => p.id !== id) })),
      addSubTopic: (planId, title) => set((state) => ({
        plans: state.plans.map(p => p.id === planId ? {
          ...p,
          subTopics: [...p.subTopics, { id: Date.now().toString(), title, completed: false }]
        } : p)
      })),
      toggleSubTopic: (planId, subTopicId) => set((state) => ({
        plans: state.plans.map(p => p.id === planId ? {
          ...p,
          subTopics: p.subTopics.map(st => st.id === subTopicId ? { ...st, completed: !st.completed } : st)
        } : p)
      })),
      deleteSubTopic: (planId, subTopicId) => set((state) => ({
        plans: state.plans.map(p => p.id === planId ? {
          ...p,
          subTopics: p.subTopics.filter(st => st.id !== subTopicId)
        } : p)
      })),

      // Clock Format
      is24HourClock: false,
      toggle24HourClock: () => set((state) => ({ is24HourClock: !state.is24HourClock })),

      // Countdowns
      countdowns: [
        { id: '1', title: 'Target 1', endDate: null },
        { id: '2', title: 'Target 2', endDate: null },
        { id: '3', title: 'Target 3', endDate: null },
      ],
      updateCountdown: (id, title, endDate) => set((state) => ({
        countdowns: state.countdowns.map(c => c.id === id ? { ...c, title, endDate } : c)
      })),

      // Timetable
      timetableGrid: {
        "Mon": { "09:00 AM": "DSA", "10:00 AM": "Web Dev", "11:00 AM": "OS", "12:00 PM": "Lunch", "01:00 PM": "Math", "02:00 PM": "Physics", "03:00 PM": "Project", "04:00 PM": "Free", "05:00 PM": "Free" },
        "Tue": { "09:00 AM": "Math", "10:00 AM": "DSA", "11:00 AM": "Web Dev", "12:00 PM": "Lunch", "01:00 PM": "OS", "02:00 PM": "DB", "03:00 PM": "Project", "04:00 PM": "Free", "05:00 PM": "Free" },
        "Wed": { "09:00 AM": "OS", "10:00 AM": "Math", "11:00 AM": "DSA", "12:00 PM": "Lunch", "01:00 PM": "Web Dev", "02:00 PM": "Physics", "03:00 PM": "Project", "04:00 PM": "Free", "05:00 PM": "Free" },
        "Thu": { "09:00 AM": "DB", "10:00 AM": "OS", "11:00 AM": "Math", "12:00 PM": "Lunch", "01:00 PM": "DSA", "02:00 PM": "Web Dev", "03:00 PM": "Project", "04:00 PM": "Free", "05:00 PM": "Free" },
        "Fri": { "09:00 AM": "Web Dev", "10:00 AM": "DB", "11:00 AM": "OS", "12:00 PM": "Lunch", "01:00 PM": "Math", "02:00 PM": "DSA", "03:00 PM": "Project", "04:00 PM": "Free", "05:00 PM": "Free" },
        "Sat": { "09:00 AM": "Free", "10:00 AM": "Free", "11:00 AM": "Free", "12:00 PM": "Free", "01:00 PM": "Free", "02:00 PM": "Free", "03:00 PM": "Free", "04:00 PM": "Free", "05:00 PM": "Free" },
        "Sun": { "09:00 AM": "Free", "10:00 AM": "Free", "11:00 AM": "Free", "12:00 PM": "Free", "01:00 PM": "Free", "02:00 PM": "Free", "03:00 PM": "Free", "04:00 PM": "Free", "05:00 PM": "Free" },
      },
      updateTimetableCell: (day, time, subject) => set((state) => ({
        timetableGrid: {
          ...state.timetableGrid,
          [day]: {
            ...state.timetableGrid[day],
            [time]: subject
          }
        }
      })),
      isTimetableOpen: false,
      setIsTimetableOpen: (isOpen) => set({ isTimetableOpen: isOpen }),

      // Health Rings
      healthData: {},
      fetchHealthData: async () => {
        try {
          const res = await fetch(`/api/health?profileId=${getActiveProfileId()}`);
          if (res.ok) {
            const json = await res.json();
            if (json.data) {
              set({ healthData: json.data });
            }
          }
        } catch (err) {
          console.error('Failed to fetch health data', err);
        }
      },
      isHealthModalOpen: false,
      toggleHealthModal: () => set((state) => ({ isHealthModalOpen: !state.isHealthModalOpen })),
      updateHealth: (dateKey, metric, incrementValue) => {
        // Optimistic UI update
        set((state) => {
          const newData = { ...state.healthData };
          if (!newData[dateKey]) {
            newData[dateKey] = { water: 0, stretch: 0, reading: 0, academic: 0, english: 0 };
          }
          newData[dateKey] = {
            ...newData[dateKey],
            [metric]: Math.max(0, newData[dateKey][metric] + incrementValue)
          };
          return { healthData: newData };
        });

        // Background API sync
        fetch('/api/health', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profileId: getActiveProfileId(), dateKey, metric, incrementValue })
        }).catch(err => console.error("Failed to sync health data", err));
      },

      clockOffsets: {},
      updateClockOffset: (bgSrc, x, y) => set((state) => ({
        clockOffsets: { ...state.clockOffsets, [bgSrc]: { x, y } }
      })),
      resetClockOffset: (bgSrc) => set((state) => {
        const newOffsets = { ...state.clockOffsets };
        delete newOffsets[bgSrc];
        return { clockOffsets: newOffsets };
      }),
      
      widgetOffsets: {},
      updateWidgetOffset: (bgSrc, widgetId, x, y) => set((state) => {
        const currentBgOffsets = state.widgetOffsets[bgSrc] || {};
        return {
          widgetOffsets: {
            ...state.widgetOffsets,
            [bgSrc]: { ...currentBgOffsets, [widgetId]: { x, y } }
          }
        };
      }),
      resetWidgetOffset: (bgSrc, widgetId) => set((state) => {
        if (!state.widgetOffsets[bgSrc]) return state;
        const newBgOffsets = { ...state.widgetOffsets[bgSrc] };
        delete newBgOffsets[widgetId];
        return {
          widgetOffsets: {
            ...state.widgetOffsets,
            [bgSrc]: newBgOffsets
          }
        };
      }),
      
      lockedWidgets: ['quote', 'tasks', 'countdowns'],
      toggleWidgetLock: (widgetId) => set((state) => ({
        lockedWidgets: state.lockedWidgets.includes(widgetId)
          ? state.lockedWidgets.filter(id => id !== widgetId)
          : [...state.lockedWidgets, widgetId]
      })),
      resetAllOffsets: (bgSrc) => set((state) => {
        const newClockOffsets = { ...state.clockOffsets };
        delete newClockOffsets[bgSrc];
        
        const newWidgetOffsets = { ...state.widgetOffsets };
        delete newWidgetOffsets[bgSrc];
        
        return {
          clockOffsets: newClockOffsets,
          widgetOffsets: newWidgetOffsets
        };
      }),
      
      hiddenWallpapers: [],
      toggleWallpaperVisibility: (filename) => set((state) => ({
        hiddenWallpapers: state.hiddenWallpapers.includes(filename)
          ? state.hiddenWallpapers.filter(name => name !== filename)
          : [...state.hiddenWallpapers, filename]
      })),

      isSlideshowEnabled: false,
      setIsSlideshowEnabled: (enabled) => set({ isSlideshowEnabled: enabled }),
      slideshowIntervalMins: 10,
      setSlideshowIntervalMins: (mins) => set({ slideshowIntervalMins: mins }),

      upiId: '',
      setUpiId: (id) => set({ upiId: id }),

      showHealth: true,
      showQuote: true,
      showTimer: true,
      showCountdowns: true,
      showVideoControls: true,
      showClock: true,
      showTasks: true,
      showCalendar: true,
      showTodayWork: true,
      toggleVisibility: (key) => set((state) => ({ [key]: !state[key] })),

      clearOldData: async (days: number) => {
        try {
          const profileId = getActiveProfileId();
          await fetch(`/api/health?profileId=${profileId}&action=olderThan&days=${days}`, { method: 'DELETE' });
          
          set((state) => {
            const newHistory = { ...state.history };
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - days);
            const cutoffDateStr = cutoffDate.toISOString().split('T')[0];

            Object.keys(newHistory).forEach((key) => {
              if (key < cutoffDateStr) {
                delete newHistory[key];
              }
            });

            // Also clear healthData locally
            const newHealthData = { ...state.healthData };
            Object.keys(newHealthData).forEach((key) => {
              if (key < cutoffDateStr) {
                delete newHealthData[key];
              }
            });

            return { history: newHistory, healthData: newHealthData };
          });
        } catch (err) {
          console.error("Failed to clear old data", err);
        }
      },

      clearAllData: async () => {
        try {
          const profileId = getActiveProfileId();
          await fetch(`/api/health?profileId=${profileId}&action=deleteAll`, { method: 'DELETE' });
          await fetch('/api/store', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ profileId, data: null })
          });
          localStorage.removeItem(`dashboard-storage-${profileId}`);
          window.location.reload();
        } catch (err) {
          console.error("Failed to clear all data", err);
        }
      },
    }),
    {
      name: 'dashboard-storage',
      storage: fileStorage,
      partialize: (state) => Object.fromEntries(
        Object.entries(state).filter(([key]) => ![
          'isQuotePopupOpen', 'isTaskManagerOpen', 'isStatsOpen', 'timerTrigger', 
          'isNotesOpen', 'isPlansOpen', 'isTimetableOpen', 'isHealthModalOpen', 'healthData',
          'isVideoMuted', 'isVideoPlaying', 'isSettingsOpen'
        ].includes(key))
      ),
      merge: (persistedState: any, currentState: DashboardState) => {
        // Clean up expired timers from past sessions
        if (persistedState.timerEndAt && persistedState.timerEndAt < Date.now()) {
          persistedState.timerEndAt = null;
          persistedState.timerPausedLeft = null;
          persistedState.timerInitialMins = null;
          persistedState.activeTaskId = null;
          persistedState.activeTaskTitle = null;
        }
        
        // If the user quickly started a new timer before hydration finished, keep their new timer!
        if (currentState.timerEndAt) {
          persistedState.timerEndAt = currentState.timerEndAt;
          persistedState.timerPausedLeft = currentState.timerPausedLeft;
          persistedState.timerInitialMins = currentState.timerInitialMins;
          persistedState.activeTaskId = currentState.activeTaskId;
          persistedState.activeTaskTitle = currentState.activeTaskTitle;
          persistedState.timerLastSavedChunks = currentState.timerLastSavedChunks;
        }

        return { ...currentState, ...persistedState };
      },
    }
  )
);
