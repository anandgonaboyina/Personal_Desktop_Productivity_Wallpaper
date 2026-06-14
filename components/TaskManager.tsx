'use client';

import { useState, useRef } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { Plus, Play, Trash2, CheckCircle, Circle, Clock } from 'lucide-react';
import { fetchQuote } from '@/utils/quoteEngine';
import DraggableWidget from './DraggableWidget';
import ScrollableWithArrows from './ScrollableWithArrows';

export default function TaskManager() {
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskDuration, setNewTaskDuration] = useState('25');
    const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
    const [editingDurationId, setEditingDurationId] = useState<string | null>(null);

    const { tasks, addTask, toggleTask, deleteTask, triggerTimer, isTaskManagerOpen, showQuotePopup, editTaskDuration, updateTaskTitle } = useDashboardStore();

    if (!isTaskManagerOpen) return null;

    const handleToggleTask = async (id: string) => {
        const task = tasks.find(t => t.id === id);
        toggleTask(id);

        // If we are completing the task (it was false before), show a quote!
        if (task && !task.completed) {
            const q = await fetchQuote();
            showQuotePopup(q);
        }
    };

    const handleAddTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;

        addTask({
            id: Date.now().toString(),
            title: newTaskTitle.trim(),
            duration: parseInt(newTaskDuration) || 25,
            completed: false
        });

        setNewTaskTitle('');
    };

    const totalRemainingMinutes = tasks.filter(t => !t.completed).reduce((sum, t) => sum + (t.duration || 0), 0);
    const formatRemainingTime = (mins: number) => {
        if (mins < 60) return `${mins}m left`;
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return m > 0 ? `${h}h ${m}m left` : `${h}h left`;
    };

    return (
        <DraggableWidget id="tasks">
            <div className="w-80 rounded-3xl bg-white/10 backdrop-blur-3xl border border-white/20 shadow-2xl flex flex-col overflow-hidden text-white pointer-events-auto">
                <div className="px-4 py-2.5 border-b border-white/10 bg-black/20 flex items-center justify-between cursor-grab active:cursor-grabbing">
                    <h2 className="text-sm font-bold tracking-widest text-white uppercase drop-shadow-md">Tasks</h2>
                    <div className="flex items-center gap-2.5 text-[9px] font-bold tracking-widest text-white/60 uppercase">
                        <span>{tasks.filter(t => !t.completed).length} Pending</span>
                        {totalRemainingMinutes > 0 && (
                            <>
                                <span className="w-1 h-1 rounded-full bg-white/20" />
                                <span className="text-blue-300/90 flex items-center gap-1">
                                    <Clock size={10} className="mb-[1px]" /> {formatRemainingTime(totalRemainingMinutes)}
                                </span>
                            </>
                        )}
                    </div>
                </div>

                <ScrollableWithArrows className="p-2 max-h-[332px]">
                        {tasks.length === 0 ? (
                            <div className="text-center text-white/40 p-4 text-sm">
                                No tasks yet. Add one to focus!
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2">
                                {tasks.map((task, index) => (
                                    <div
                                        key={task.id}
                                        className={`group flex items-start justify-between p-3 rounded-2xl border border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10 transition-all shadow-sm ${task.completed ? 'opacity-50' : ''}`}
                                    >
                                        <div className="flex items-start gap-2.5 flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mt-[2px] shrink-0">
                                                <span className="text-[13px] font-bold text-white/40 tabular-nums w-5 text-right select-none">{index + 1}.</span>
                                                <button onClick={() => handleToggleTask(task.id)} className="text-white/60 hover:text-white transition-colors">
                                                    {task.completed ? <CheckCircle size={18} className="text-green-400" /> : <Circle size={18} />}
                                                </button>
                                            </div>
                                            <div className="flex flex-col gap-1.5 flex-1 min-w-0 w-full ml-0.5">
                                                {editingTaskId === task.id ? (
                                                    <textarea
                                                        autoFocus
                                                        onBlur={() => setEditingTaskId(null)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                                e.preventDefault();
                                                                setEditingTaskId(null);
                                                            }
                                                        }}
                                                        ref={(el) => {
                                                            if (el) {
                                                                el.style.height = 'auto';
                                                                el.style.height = el.scrollHeight + 'px';
                                                            }
                                                        }}
                                                        value={task.title}
                                                        onChange={(e) => {
                                                            e.target.style.height = 'auto';
                                                            e.target.style.height = e.target.scrollHeight + 'px';
                                                            updateTaskTitle(task.id, e.target.value);
                                                        }}
                                                        rows={1}
                                                        spellCheck={false}
                                                        className={`bg-black/40 outline-none w-full text-sm leading-snug border-b border-white/20 px-1 -mx-1 resize-none overflow-hidden block text-white rounded`}
                                                    />
                                                ) : (
                                                    <div 
                                                        onDoubleClick={() => setEditingTaskId(task.id)}
                                                        title="Double click to edit"
                                                        className={`w-full text-sm leading-snug px-1 -mx-1 cursor-grab whitespace-pre-wrap ${task.completed ? 'line-through text-white/50' : 'text-white'}`}
                                                    >
                                                        {task.title}
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-1.5 mt-0.5 overflow-hidden w-full">
                                                    {task.duration > 0 && !task.completed && (
                                                        editingDurationId === task.id ? (
                                                            <div className="shrink-0 flex items-center bg-blue-500/40 rounded-full border border-blue-400/30 px-2 py-0.5 shadow-sm">
                                                                <input
                                                                    autoFocus
                                                                    type="number"
                                                                    defaultValue={task.duration}
                                                                    min="1"
                                                                    max="999"
                                                                    className="w-10 bg-transparent text-[11px] font-semibold text-white outline-none placeholder:text-white/50 text-center"
                                                                    onBlur={(e) => {
                                                                        const dur = parseInt(e.target.value);
                                                                        if (!isNaN(dur) && dur > 0) editTaskDuration(task.id, dur);
                                                                        setEditingDurationId(null);
                                                                    }}
                                                                    onKeyDown={(e) => {
                                                                        if (e.key === 'Enter') {
                                                                            const dur = parseInt(e.currentTarget.value);
                                                                            if (!isNaN(dur) && dur > 0) editTaskDuration(task.id, dur);
                                                                            setEditingDurationId(null);
                                                                        }
                                                                    }}
                                                                />
                                                                <span className="text-[11px] font-semibold text-white/90 ml-0.5">m</span>
                                                            </div>
                                                        ) : (
                                                            <span
                                                                onDoubleClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setEditingDurationId(task.id);
                                                                }}
                                                                className="shrink-0 text-[11px] font-semibold tracking-wide text-white/90 bg-blue-500/40 hover:bg-blue-500/60 cursor-pointer px-2 py-0.5 rounded-full border border-blue-400/30 transition-colors shadow-sm"
                                                                title="Double click to edit duration"
                                                            >
                                                                {task.duration >= 60 ? Math.floor(task.duration / 60) + "h " + (task.duration % 60) + "m" : task.duration + "m"} left
                                                            </span>
                                                        )
                                                    )}
                                                    {task.timeSpent !== undefined && task.timeSpent > 0 && !task.completed && (
                                                        <span
                                                            className="shrink-0 text-[11px] font-semibold tracking-wide text-green-100 bg-green-500/40 px-2 py-0.5 rounded-full border border-green-400/30 shadow-sm pointer-events-none"
                                                            title="Total time tracked for this task"
                                                        >
                                                            {task.timeSpent >= 60 ? Math.floor(task.timeSpent / 60) + "h " + (task.timeSpent % 60) + "m" : task.timeSpent + "m"} done
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => triggerTimer(task.duration, task.id, task.title)}
                                                className="p-1.5 bg-blue-500/20 text-blue-300 hover:bg-blue-500 hover:text-white rounded-lg transition-colors"
                                                title={`Start ${task.duration}m timer`}
                                            >
                                                <Play size={14} className="fill-current" />
                                            </button>
                                            <button
                                                onClick={() => deleteTask(task.id)}
                                                className="p-1.5 text-white/40 hover:text-red-400 hover:bg-red-400/20 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                </ScrollableWithArrows>

                <form onSubmit={handleAddTask} className="p-3 border-t border-white/10 bg-black/10 flex gap-1">
                    <input
                        type="text"
                        placeholder="New task..."
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:bg-white/10 transition-colors placeholder:text-white/40"
                    />
                    <input
                        type="number"
                        placeholder="min"
                        value={newTaskDuration}
                        onChange={(e) => setNewTaskDuration(e.target.value)}
                        title="Minutes"
                        className="w-16 bg-white/5 border border-white/10 rounded-xl px-2 py-2 text-sm text-center outline-none focus:bg-white/10 transition-colors placeholder:text-white/40 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button type="submit" className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors shrink-0">
                        <Plus size={20} />
                    </button>
                </form>
            </div>
        </DraggableWidget>
    );
}
