'use client';

import { useState, useRef } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { Plus, Play, Trash2, CheckCircle, Circle, ChevronUp, ChevronDown } from 'lucide-react';
import { fetchQuote } from '@/utils/quoteEngine';
import DraggableWidget from './DraggableWidget';

export default function TaskManager() {
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskDuration, setNewTaskDuration] = useState('25');

    const { tasks, addTask, toggleTask, deleteTask, triggerTimer, isTaskManagerOpen, showQuotePopup, editTaskDuration } = useDashboardStore();
    const taskScrollRef = useRef<HTMLDivElement>(null);

    if (!isTaskManagerOpen) return null;

    const scrollBy = (ref: React.RefObject<HTMLDivElement | null>, direction: 'up' | 'down') => {
        if (ref.current) {
            ref.current.scrollBy({ top: direction === 'up' ? -150 : 150, behavior: 'smooth' });
        }
    };

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

    return (
        <DraggableWidget id="tasks">
            <div className="w-80 rounded-3xl bg-white/10 backdrop-blur-3xl border border-white/20 shadow-2xl flex flex-col overflow-hidden text-white pointer-events-auto">
                <div className="p-4 border-b border-white/10 bg-black/10">
                    <h2 className="text-lg font-medium text-center tracking-wide cursor-grab active:cursor-grabbing">Tasks</h2>
                </div>

                <div className="relative flex-1 overflow-hidden flex flex-col">
                    <div 
                        ref={taskScrollRef}
                        className="flex-1 overflow-y-auto p-2 [&::-webkit-scrollbar]:hidden max-h-[332px]"
                        onWheel={(e) => { e.stopPropagation(); e.currentTarget.scrollTop += e.deltaY; }}
                    >
                        {tasks.length === 0 ? (
                        <div className="text-center text-white/40 p-4 text-sm">
                            No tasks yet. Add one to focus!
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {tasks.map((task) => (
                                <div
                                    key={task.id}
                                    className={`group flex items-start justify-between p-3 rounded-2xl border border-transparent hover:border-white/10 hover:bg-white/5 transition-all ${task.completed ? 'opacity-50' : ''}`}
                                >
                                    <div className="flex items-start gap-3 flex-1 min-w-0">
                                        <button onClick={() => handleToggleTask(task.id)} className="shrink-0 text-white/60 hover:text-white transition-colors">
                                            {task.completed ? <CheckCircle size={20} className="text-green-400" /> : <Circle size={20} />}
                                        </button>
                                        <div className="flex flex-col flex-1 min-w-0 w-full">
                                            <span className={`whitespace-normal break-words text-sm leading-snug ${task.completed ? 'line-through' : ''}`}>
                                                {task.title}
                                            </span>
                                            {task.duration > 0 && !task.completed && (
                                                <span 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        const newDur = window.prompt(`Enter new duration (in minutes) for "${task.title}":`, task.duration.toString());
                                                        if (newDur !== null) {
                                                            const dur = parseInt(newDur);
                                                            if (!isNaN(dur)) editTaskDuration(task.id, dur);
                                                        }
                                                    }}
                                                    className="text-xs font-medium text-white/90 bg-blue-500/40 hover:bg-blue-500/60 cursor-pointer px-2.5 py-0.5 rounded-full w-fit mt-1 border border-white/20 transition-colors"
                                                    title="Click to edit duration"
                                                >
                                                    {task.duration >= 60 ? Math.floor(task.duration / 60) + "h " + (task.duration % 60) + "m left" : task.duration + "m left"}
                                                </span>
                                            )}
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
                    </div>

                    {/* Tiny Scroll Arrows */}
                    <div className="absolute inset-x-0 top-0 bottom-0 flex flex-col justify-between items-center pointer-events-none">
                        <button onMouseDown={(e) => e.preventDefault()} onClick={() => scrollBy(taskScrollRef, 'up')} className="pointer-events-auto flex items-center justify-center w-12 h-5 bg-blue-500/80 hover:bg-blue-500 border-x border-b border-blue-400/50 rounded-b-xl text-white backdrop-blur-md transition-all shadow-[0_0_10px_rgba(59,130,246,0.5)]"><ChevronUp size={16} strokeWidth={3} /></button>
                        <button onMouseDown={(e) => e.preventDefault()} onClick={() => scrollBy(taskScrollRef, 'down')} className="pointer-events-auto flex items-center justify-center w-12 h-5 bg-blue-500/80 hover:bg-blue-500 border-x border-t border-blue-400/50 rounded-t-xl text-white backdrop-blur-md transition-all shadow-[0_0_10px_rgba(59,130,246,0.5)]"><ChevronDown size={16} strokeWidth={3} /></button>
                    </div>
                </div>

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
                        value={newTaskDuration}
                        onChange={(e) => setNewTaskDuration(e.target.value)}
                        title="Minutes"
                        className="w-16 bg-white/5 border border-white/10 rounded-xl px-2 py-2 text-sm text-center outline-none focus:bg-white/10 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button type="submit" className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors shrink-0">
                        <Plus size={20} />
                    </button>
                </form>
            </div>
        </DraggableWidget>
    );
}
