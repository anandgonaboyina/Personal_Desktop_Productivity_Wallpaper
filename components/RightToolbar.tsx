'use client';

import { useDashboardStore } from '@/store/dashboardStore';
import { Map, ListTodo, BarChart2, StickyNote, Settings, Clock } from 'lucide-react';
import DraggableWidget from './DraggableWidget';

export default function RightToolbar() {
  const isHidden = useDashboardStore((state) => state.isHidden);
  
  const isPlansOpen = useDashboardStore((state) => state.isPlansOpen);
  const togglePlans = useDashboardStore((state) => state.togglePlans);
  
  const isTaskManagerOpen = useDashboardStore((state) => state.isTaskManagerOpen);
  const toggleTaskManager = useDashboardStore((state) => state.toggleTaskManager);
  
  const isStatsOpen = useDashboardStore((state) => state.isStatsOpen);
  const toggleStats = useDashboardStore((state) => state.toggleStats);
  
  const isNotesOpen = useDashboardStore((state) => state.isNotesOpen);
  const toggleNotes = useDashboardStore((state) => state.toggleNotes);
  
  const toggleSettings = useDashboardStore((state) => state.toggleSettings);
  const showSettingsBtn = useDashboardStore((state) => state.showSettingsBtn);
  const hideConfig = useDashboardStore((state) => state.hideConfig);
  const isStopwatchOpen = useDashboardStore((state) => state.isStopwatchOpen);
  const toggleStopwatch = useDashboardStore((state) => state.toggleStopwatch);
  const showStopwatch = useDashboardStore((state) => state.showStopwatch);
  const showPlans = useDashboardStore((state) => state.showPlans);
  const showTasks = useDashboardStore((state) => state.showTasks);
  const showStats = useDashboardStore((state) => state.showStats);
  const showNotes = useDashboardStore((state) => state.showNotes);

  return (
    <DraggableWidget id="toolbar">
      <div className="flex flex-col gap-3 pointer-events-auto">
        {/* Plans Toggle Button */}
        {(!isHidden || !hideConfig.plans) && showPlans && (
          <button
            onClick={togglePlans}
            className={`p-3 rounded-2xl border border-white/20 shadow-xl transition-all ${isPlansOpen ? 'bg-white/30 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white backdrop-blur-xl'}`}
            title="Roadmap & Plans"
          >
            <Map size={24} />
          </button>
        )}

        {/* Task Manager Toggle Button */}
        {(!isHidden || !hideConfig.tasks) && showTasks && (
          <button
            onClick={toggleTaskManager}
            className={`p-3 rounded-2xl border border-white/20 shadow-xl transition-all ${isTaskManagerOpen ? 'bg-white/30 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white backdrop-blur-xl'}`}
            title="Toggle Tasks"
          >
            <ListTodo size={24} />
          </button>
        )}

        {/* Stats Toggle Button */}
        {(!isHidden || !hideConfig.stats) && showStats && (
          <button
            onClick={toggleStats}
            className={`p-3 rounded-2xl border border-white/20 shadow-xl transition-all ${isStatsOpen ? 'bg-white/30 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white backdrop-blur-xl'}`}
            title="Focus History"
          >
            <BarChart2 size={24} />
          </button>
        )}

        {/* Stopwatch Toggle Button */}
        {(!isHidden || !hideConfig.stopwatch) && showStopwatch && (
          <button
            onClick={toggleStopwatch}
            className={`p-3 rounded-2xl border border-white/20 shadow-xl transition-all ${isStopwatchOpen ? 'bg-white/30 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white backdrop-blur-xl'}`}
            title="Stopwatch"
          >
            <Clock size={24} />
          </button>
        )}

        {/* Notes Toggle Button */}
        {(!isHidden || !hideConfig.notes) && showNotes && (
          <button
            onClick={toggleNotes}
            className={`p-3 rounded-2xl border border-white/20 shadow-xl transition-all ${isNotesOpen ? 'bg-white/30 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white backdrop-blur-xl'}`}
            title="Quick Notes"
          >
            <StickyNote size={24} />
          </button>
        )}

        {/* Settings Toggle Button */}
        {(!isHidden || !hideConfig.settingsBtn) && showSettingsBtn && (
          <button
            onClick={toggleSettings}
            className="p-3 rounded-2xl border border-white/20 shadow-xl transition-all bg-white/10 text-white/70 hover:bg-white/20 hover:text-white backdrop-blur-xl"
            title="Settings"
          >
            <Settings size={24} />
          </button>
        )}
      </div>
    </DraggableWidget>
  );
}
