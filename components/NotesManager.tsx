'use client';
import { useState, useEffect, useRef } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { Plus, X, StickyNote, Trash2, Undo, Redo, Bold, Italic, Underline, List } from 'lucide-react';
import ScrollableWithArrows from './ScrollableWithArrows';

function EditorBlock({ date, initialHtml, onChange }: { date: string; initialHtml: string; onChange: (html: string) => void }) {
  const editorRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Only set initial HTML once when mounting to prevent cursor jumps
    if (editorRef.current && editorRef.current.innerHTML === '') {
      editorRef.current.innerHTML = initialHtml;
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [initialHtml]);

  const handleInput = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (editorRef.current) {
        onChange(editorRef.current.innerHTML);
      }
    }, 300);
  };

  const handleBlur = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  return (
    <div className="mb-8 relative group">
      <h3 className="text-xl font-bold text-white/50 border-b border-white/10 pb-2 mb-3 select-none tracking-wide">
        {date}
      </h3>
      <div
        ref={editorRef}
        contentEditable
        spellCheck={false}
        onInput={handleInput}
        onBlur={handleBlur}
        className="select-text cursor-text outline-none text-white/90 min-h-[60px] text-lg leading-relaxed transition-all focus:bg-white/5 p-4 rounded-2xl border border-transparent focus:border-white/10 [&_h1]:text-4xl [&_h1]:font-bold [&_h1]:mb-4 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:mb-3 [&_p]:mb-2 [&_ul]:list-disc [&_ul]:ml-6 [&_b]:font-bold [&_i]:italic [&_u]:underline"
      />
    </div>
  );
}

export default function NotesManager() {
  const { isNotesOpen, toggleNotes, notes, activeNoteId, addNote, updateNoteTitle, updateNoteEntry, deleteNote, setActiveNote } = useDashboardStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted || !isNotesOpen) return null;

  return (
    <NotepadModal
      toggleNotes={toggleNotes}
      notes={notes}
      activeNoteId={activeNoteId}
      addNote={addNote}
      updateNoteTitle={updateNoteTitle}
      updateNoteEntry={updateNoteEntry}
      deleteNote={deleteNote}
      setActiveNote={setActiveNote}
    />
  );
}

function NotepadModal({ toggleNotes, notes, activeNoteId, addNote, updateNoteTitle, updateNoteEntry, deleteNote, setActiveNote }: any) {
  const [format, setFormat] = useState({ bold: false, italic: false, underline: false, list: false });

  useEffect(() => {
    const checkFormat = () => {
      setFormat({
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        underline: document.queryCommandState('underline'),
        list: document.queryCommandState('insertUnorderedList')
      });
    };
    document.addEventListener('selectionchange', checkFormat);
    return () => document.removeEventListener('selectionchange', checkFormat);
  }, []);

  const activeNote = notes.find((n: any) => n.id === activeNoteId) || notes[0];

  const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // Handle legacy notes from old storage format safely
  const entries = activeNote?.entries || {};
  if (activeNote && !activeNote.entries && activeNote.content) {
    entries[todayStr] = activeNote.content; // Recover old text
  }

  // Get all existing dates for the active note
  const existingDates = Object.keys(entries).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  if (!existingDates.includes(todayStr)) {
    existingDates.push(todayStr); // Always show today at the bottom
  }

  const exec = (cmd: string, val?: string) => {
    document.execCommand(cmd, false, val);
  };


  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pb-20 sm:pb-24 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300 pointer-events-auto">
      <div className="absolute inset-0" onClick={toggleNotes} />

      <div className="relative w-full max-w-6xl h-[85vh] max-h-[850px] flex rounded-3xl bg-black/60 backdrop-blur-2xl border border-white/20 shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300">

        {/* Left Sidebar: Notes List */}
        <div className="w-1/4 max-w-[300px] bg-white/5 border-r border-white/10 flex flex-col">
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

          <div className="relative flex-1 overflow-hidden flex flex-col">
            <ScrollableWithArrows className="p-2 flex flex-col gap-1 pr-1">
              {notes.map((note: any) => (
                <div
                  key={note.id}
                  onClick={() => setActiveNote(note.id)}
                  className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${activeNoteId === note.id ? 'bg-white/20 text-white shadow-md' : 'text-white/60 hover:bg-white/10 hover:text-white'}`}
                >
                  <span className="font-medium truncate pr-2">{note.title || 'Untitled Note'}</span>
                  <button
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      if (window.confirm(`Are you sure you want to delete the note "${note.title || 'Untitled Note'}"?`)) {
                        deleteNote(note.id); 
                      }
                    }}
                    className={`p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/20 hover:text-red-400 transition-all shrink-0 ${notes.length === 1 ? 'hidden' : ''}`}
                    title="Delete Note"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </ScrollableWithArrows>
        </div>
      </div>

        {/* Right Pane: Editor Area */}
        <div className="flex-1 flex flex-col relative bg-black/20">
          <button
            onClick={toggleNotes}
            className="absolute top-4 right-4 p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-full transition-colors z-10"
          >
            <X size={20} />
          </button>

          {activeNote && (
            <div className="flex-1 flex flex-col p-8 pt-12 overflow-hidden relative">
              <input
                type="text"
                value={activeNote.title}
                onChange={(e) => updateNoteTitle(activeNote.id, e.target.value)}
                placeholder="Note Title"
                className="bg-transparent text-3xl font-bold text-white outline-none mb-4 placeholder:text-white/20 px-4"
              />

              <div className="relative flex-1 overflow-hidden flex flex-col">
                <ScrollableWithArrows className="px-4 pb-32" downArrowOffset="bottom-24">
                  {existingDates.map((date) => (
                    <EditorBlock
                      key={`${activeNote.id}-${date}`}
                      date={date}
                      initialHtml={entries[date] || ''}
                      onChange={(html) => updateNoteEntry(activeNote.id, date, html)}
                    />
                  ))}
                </ScrollableWithArrows>
              </div>
            </div>
          )}

          {/* Floating Toolbar */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-4 py-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl z-50">
            <button onMouseDown={(e) => e.preventDefault()} onClick={() => exec('undo')} className="p-2.5 hover:bg-white/10 rounded-xl text-white transition-colors" title="Undo"><Undo size={18} /></button>
            <button onMouseDown={(e) => e.preventDefault()} onClick={() => exec('redo')} className="p-2.5 hover:bg-white/10 rounded-xl text-white transition-colors" title="Redo"><Redo size={18} /></button>

            <div className="w-px h-8 bg-white/20 mx-2" />

            <button onMouseDown={(e) => e.preventDefault()} onClick={() => exec('formatBlock', 'H1')} className="p-2.5 hover:bg-white/10 rounded-xl text-white font-bold text-sm transition-colors" title="Heading 1">H1</button>
            <button onMouseDown={(e) => e.preventDefault()} onClick={() => exec('formatBlock', 'H2')} className="p-2.5 hover:bg-white/10 rounded-xl text-white font-bold text-sm transition-colors" title="Heading 2">H2</button>
            <button onMouseDown={(e) => e.preventDefault()} onClick={() => exec('formatBlock', 'P')} className="p-2.5 hover:bg-white/10 rounded-xl text-white text-sm transition-colors" title="Normal Text">P</button>

            <div className="w-px h-8 bg-white/20 mx-2" />

            <button onMouseDown={(e) => e.preventDefault()} onClick={() => exec('bold')} className={`p-2.5 rounded-xl transition-colors ${format.bold ? 'bg-blue-500 text-white' : 'hover:bg-white/10 text-white'}`} title="Bold"><Bold size={18} /></button>
            <button onMouseDown={(e) => e.preventDefault()} onClick={() => exec('italic')} className={`p-2.5 rounded-xl transition-colors ${format.italic ? 'bg-blue-500 text-white' : 'hover:bg-white/10 text-white'}`} title="Italic"><Italic size={18} /></button>
            <button onMouseDown={(e) => e.preventDefault()} onClick={() => exec('underline')} className={`p-2.5 rounded-xl transition-colors ${format.underline ? 'bg-blue-500 text-white' : 'hover:bg-white/10 text-white'}`} title="Underline"><Underline size={18} /></button>

            <div className="w-px h-8 bg-white/20 mx-2" />

            <button onMouseDown={(e) => e.preventDefault()} onClick={() => exec('insertUnorderedList')} className={`p-2.5 rounded-xl transition-colors ${format.list ? 'bg-blue-500 text-white' : 'hover:bg-white/10 text-white'}`} title="Bullet List"><List size={18} /></button>
          </div>
        </div>

      </div>
    </div>
  );
}
