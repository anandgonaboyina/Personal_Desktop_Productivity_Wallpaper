'use client';
import { useState, useEffect } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { Plus, X, StickyNote, Trash2 } from 'lucide-react';

// Debounce hook to prevent excessive saves
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function NotesManager() {
  const { isNotesOpen } = useDashboardStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted || !isNotesOpen) return null;

  return <NotesEditor />;
}

function NotesEditor() {
  const { notes, activeNoteId, toggleNotes, addNote, updateNote, deleteNote, setActiveNote } = useDashboardStore();

  const activeNote = notes.find(n => n.id === activeNoteId) || notes[0];

  // Initialize local state perfectly from the hydrated store
  const [title, setTitle] = useState(activeNote?.title || '');
  const [content, setContent] = useState(activeNote?.content || '');

  // Sync local state ONLY when the user switches to a different note
  useEffect(() => {
    if (activeNote) {
      setTitle(activeNote.title);
      setContent(activeNote.content);
    }
  }, [activeNote?.id]);

  // Debounce the local state
  const debouncedTitle = useDebounce(title, 300);
  const debouncedContent = useDebounce(content, 300);

  // Commit to Zustand store every 300ms when typing stops
  useEffect(() => {
    if (activeNote && (debouncedTitle !== activeNote.title || debouncedContent !== activeNote.content)) {
      updateNote(activeNote.id, debouncedTitle, debouncedContent);
    }
  }, [debouncedTitle, debouncedContent, activeNote?.id]); // Only re-run if debounced text changes

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      {/* Click outside to close (Optional, but good UX) */}
      <div className="absolute inset-0" onClick={toggleNotes} />

      <div className="relative w-full max-w-5xl h-[80vh] flex rounded-3xl bg-black/60 backdrop-blur-2xl border border-white/20 shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300">

        {/* Left Sidebar: Vertical Tabs */}
        <div className="w-1/3 max-w-[280px] bg-white/5 border-r border-white/10 flex flex-col">
          <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
            <h2 className="text-lg font-medium text-white tracking-wide flex items-center gap-2">
              <StickyNote size={18} className="text-yellow-400" /> Notes
            </h2>
            <button
              onClick={addNote}
              className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
              title="New Note"
            >
              <Plus size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1 scrollbar-thin scrollbar-thumb-white/20">
            {notes.map(note => (
              <div
                key={note.id}
                onClick={() => setActiveNote(note.id)}
                className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${activeNoteId === note.id ? 'bg-white/20 text-white shadow-md' : 'text-white/60 hover:bg-white/10 hover:text-white'}`}
              >
                <div className="flex flex-col overflow-hidden min-w-0 pr-2">
                  <span className="font-medium truncate">{note.title || 'Untitled Note'}</span>
                  <span className="text-xs opacity-50 truncate mt-0.5">{note.content || 'No content...'}</span>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }}
                  className={`p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/20 hover:text-red-400 transition-all ${notes.length === 1 ? 'hidden' : ''}`}
                  title="Delete Note"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right Pane: Editor */}
        <div className="flex-1 flex flex-col relative bg-black/20">
          <button
            onClick={toggleNotes}
            className="absolute top-4 right-4 p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-full transition-colors z-10"
          >
            <X size={20} />
          </button>

          {activeNote && (
            <div className="flex-1 flex flex-col p-8 pt-12 overflow-hidden">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Note Title"
                className="bg-transparent text-3xl font-bold text-white outline-none mb-4 placeholder:text-white/20"
              />
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Start typing your quick note here..."
                className="flex-1 bg-transparent text-lg text-white/80 outline-none resize-none placeholder:text-white/20 scrollbar-thin scrollbar-thumb-white/20 leading-relaxed"
              />
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
