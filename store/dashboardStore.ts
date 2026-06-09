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
  content: string;
  updatedAt: number;
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
  timerTrigger: { mins: number; ts: number } | null;
  triggerTimer: (mins: number) => void;

  // Global Timer State
  timerEndAt: number | null;
  timerPausedLeft: number | null; // Keeps track of remaining time if paused
  timerInitialMins: number | null;
  isAlarmPlaying: boolean;
  setTimerEndAt: (time: number | null) => void;
  setTimerPausedLeft: (time: number | null) => void;
  setTimerInitialMins: (mins: number | null) => void;
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
  updateNote: (id: string, title: string, content: string) => void;
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
}

// ---------------------------------------------------------------------------
// Persistent storage: writes to a JSON file on disk via /api/store so that
// data survives PC reboots in Lively Wallpaper (WebView2 wipes localStorage).
// Falls back to localStorage when the API is unavailable (e.g. offline dev).
// ---------------------------------------------------------------------------
const fileStorage = createJSONStorage(() => ({
  getItem: async (_name: string): Promise<string | null> => {
    try {
      const res = await fetch('/api/store', { cache: 'no-store' });
      if (!res.ok) throw new Error('API error');
      const json = await res.json();
      if (json.data) return JSON.stringify(json.data);
    } catch {
      // Fall back to localStorage
    }
    return localStorage.getItem('dashboard-storage');
  },
  setItem: async (_name: string, value: string): Promise<void> => {
    try {
      await fetch('/api/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: JSON.parse(value) }),
      });
    } catch {
      // Only write to localStorage if API fails to prevent infinite cross-tab storage event loops
      localStorage.setItem('dashboard-storage', value);
    }
  },
  removeItem: async (_name: string): Promise<void> => {
    try {
      await fetch('/api/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: null }),
      });
    } catch { 
      localStorage.removeItem('dashboard-storage');
    }
  },
}));

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
      wallpaper: '/wallpaper.webp',
      bgIndex: 0,
      currentBgType: null,
      history: {},
      tasks: [],
      isHidden: false,

      setWallpaper: (url) => set({ wallpaper: url }),
      cycleBackground: () => set((state) => ({ bgIndex: (state.bgIndex + 1) % 3 })),
      setCurrentBgType: (type) => set({ currentBgType: type }),
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
      timerTrigger: null,
      triggerTimer: (mins) => set({ timerTrigger: { mins, ts: Date.now() } }),

      timerEndAt: null,
      timerPausedLeft: null,
      timerInitialMins: null,
      isAlarmPlaying: false,
      setTimerEndAt: (time) => set({ timerEndAt: time }),
      setTimerPausedLeft: (time) => set({ timerPausedLeft: time }),
      setTimerInitialMins: (mins) => set({ timerInitialMins: mins }),
      setIsAlarmPlaying: (playing) => set({ isAlarmPlaying: playing }),

      currentQuote: null,
      isQuotePopupOpen: false,
      showQuotePopup: (quote) => set({ currentQuote: quote, isQuotePopupOpen: true }),
      hideQuotePopup: () => set({ isQuotePopupOpen: false }),

      // Notes State
      notes: [{ id: 'default', title: 'Quick Note', content: '', updatedAt: Date.now() }],
      activeNoteId: 'default',
      isNotesOpen: false,
      addNote: () => {
        const newNote = { id: Date.now().toString(), title: 'New Note', content: '', updatedAt: Date.now() };
        set((state) => ({ notes: [newNote, ...state.notes], activeNoteId: newNote.id }));
      },
      updateNote: (id, title, content) => set((state) => ({
        notes: state.notes.map(n => n.id === id ? { ...n, title, content, updatedAt: Date.now() } : n)
      })),
      deleteNote: (id) => set((state) => {
        const newNotes = state.notes.filter(n => n.id !== id);
        // Ensure at least one note exists
        if (newNotes.length === 0) {
          const defaultNote = { id: Date.now().toString(), title: 'Quick Note', content: '', updatedAt: Date.now() };
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
    }),
    {
      name: 'dashboard-storage',
      storage: fileStorage,
      partialize: (state) => Object.fromEntries(
        Object.entries(state).filter(([key]) => ![
          'isQuotePopupOpen', 'isTaskManagerOpen', 'isStatsOpen', 'timerTrigger', 
          'isNotesOpen', 'isPlansOpen', 'isTimetableOpen'
        ].includes(key))
      ),
    }
  )
);
