import { useState, useEffect, useRef } from 'react';
import { useDashboardStore, Plan, SubTopic } from '@/store/dashboardStore';
import { Target, Plus, X, Upload, ChevronLeft, CheckCircle, Circle, Trash2, Map, Calendar, Clock, Filter, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';

const CATEGORY_SUGGESTIONS = ['DSA', 'Web Dev', 'Academics', 'Projects', 'Personal'];

const parseLocalDate = (dateStr: string) => {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('T')[0].split('-');
  return new Date(Number(y), Number(m) - 1, Number(d)).toLocaleDateString();
};


export default function PlansManager() {
  const { isPlansOpen } = useDashboardStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted || !isPlansOpen) return null;

  return <PlansEditor />;
}

function PlansEditor() {
  const { plans, togglePlans, addPlan, deletePlan, addSubTopic, toggleSubTopic, deleteSubTopic } = useDashboardStore();
  const [view, setView] = useState<'gallery' | 'add' | 'detail'>('gallery');
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const mainScrollRef = useRef<HTMLDivElement>(null);

  const scrollBy = (ref: React.RefObject<HTMLDivElement | null>, direction: 'up' | 'down') => {
    if (ref.current) {
      ref.current.scrollBy({ top: direction === 'up' ? -200 : 200, behavior: 'smooth' });
    }
  };

  // Get unique categories for filter
  const allCategories = Array.from(new Set(plans.map(p => p.category)));

  // Filter plans based on selected category
  const filteredPlans = filterCategory === 'All' ? plans : plans.filter(p => p.category === filterCategory);

  // Group filtered plans by category for gallery
  const groupedPlans = filteredPlans.reduce((acc, plan) => {
    if (!acc[plan.category]) acc[plan.category] = [];
    acc[plan.category].push(plan);
    return acc;
  }, {} as Record<string, Plan[]>);

  // Sort each group by end date ascending (closest date first)
  Object.values(groupedPlans).forEach(group => {
    group.sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime());
  });

  const selectedPlan = plans.find(p => p.id === selectedPlanId);

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300 pointer-events-auto">
      <div className="absolute inset-0" onClick={togglePlans} />

      <div className="relative w-full max-w-5xl h-[85vh] flex flex-col rounded-3xl bg-black/60 backdrop-blur-2xl border border-white/20 shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300">

        {/* Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5 shrink-0">
          <div className="flex items-center gap-3">
            {view !== 'gallery' && (
              <button
                onClick={() => setView('gallery')}
                className="p-2 -ml-2 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-colors"
              >
                <ChevronLeft size={24} />
              </button>
            )}
            <h2 className="text-2xl font-bold text-white tracking-wide flex items-center gap-3">
              <Map className="text-blue-400" size={28} />
              {view === 'gallery' ? 'Pending works' : view === 'add' ? 'New Master Plan' : selectedPlan?.title}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {view === 'gallery' && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white/70">
                  <Filter size={16} />
                  <CustomSelect
                    value={filterCategory}
                    onChange={setFilterCategory}
                    options={['All', ...allCategories]}
                  />
                </div>
                <button
                  onClick={() => setView('add')}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl transition-all shadow-lg shadow-blue-500/20"
                >
                  <Plus size={18} /> Add Plan
                </button>
              </div>
            )}
            <button
              onClick={togglePlans}
              className="p-2 ml-2 text-white/40 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="relative flex-1 overflow-hidden flex flex-col">
          <div
            ref={mainScrollRef}
            className={`flex-1 p-6 ${view === 'detail' ? 'overflow-hidden' : 'overflow-y-auto overscroll-contain [&::-webkit-scrollbar]:hidden'}`}
            onWheel={e => {
              if (view !== 'detail') {
                e.stopPropagation();
                e.currentTarget.scrollTop += e.deltaY;
              }
            }}
          >
            {view === 'gallery' && (
              <GalleryView
                groupedPlans={groupedPlans}
                onSelect={(id) => { setSelectedPlanId(id); setView('detail'); }}
              />
            )}

            {view === 'add' && (
              <AddPlanView
                onAdd={(p) => { addPlan(p); setView('gallery'); }}
                onCancel={() => setView('gallery')}
              />
            )}

            {view === 'detail' && selectedPlan && (
              <DetailView
                plan={selectedPlan}
                onAddSub={(title) => addSubTopic(selectedPlan.id, title)}
                onToggleSub={(subId) => toggleSubTopic(selectedPlan.id, subId)}
                onDeleteSub={(subId) => deleteSubTopic(selectedPlan.id, subId)}
                onDeletePlan={() => { deletePlan(selectedPlan.id); setView('gallery'); }}
              />
            )}
          </div>

          {/* Tiny Scroll Arrows (Hidden in detail view) */}
          {view !== 'detail' && (
            <div className="absolute inset-x-0 top-0 bottom-0 flex flex-col justify-between items-center pointer-events-none">
              <button onMouseDown={(e) => e.preventDefault()} onClick={() => scrollBy(mainScrollRef, 'up')} className="pointer-events-auto flex items-center justify-center w-12 h-5 bg-blue-500/80 hover:bg-blue-500 border-x border-b border-blue-400/50 rounded-b-xl text-white backdrop-blur-md transition-all shadow-[0_0_10px_rgba(59,130,246,0.5)]"><ChevronUp size={16} strokeWidth={3} /></button>
              <button onMouseDown={(e) => e.preventDefault()} onClick={() => scrollBy(mainScrollRef, 'down')} className="pointer-events-auto flex items-center justify-center w-12 h-5 bg-blue-500/80 hover:bg-blue-500 border-x border-t border-blue-400/50 rounded-t-xl text-white backdrop-blur-md transition-all shadow-[0_0_10px_rgba(59,130,246,0.5)]"><ChevronDown size={16} strokeWidth={3} /></button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function GalleryView({ groupedPlans, onSelect }: { groupedPlans: Record<string, Plan[]>, onSelect: (id: string) => void }) {
  if (Object.keys(groupedPlans).length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-white/40 italic">
        <Map size={64} className="mb-4 opacity-20" />
        <p className="text-xl mb-2">No plans defined yet.</p>
        <p>Click "Add Plan" to map out your ambitious journey!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      {Object.entries(groupedPlans).map(([category, plans]) => (
        <div key={category} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h3 className="text-xl font-semibold text-white/80 mb-4 px-2 tracking-widest uppercase text-sm border-b border-white/10 pb-2">{category}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map(plan => {
              const total = plan.subTopics.length;
              const completed = plan.subTopics.filter(st => st.completed).length;
              const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

              const today = new Date();
              today.setHours(0,0,0,0);
              const targetDate = new Date(plan.endDate);
              targetDate.setHours(0,0,0,0);
              const diffTime = targetDate.getTime() - today.getTime();
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

              return (
                <div
                  key={plan.id}
                  onClick={() => onSelect(plan.id)}
                  className="group relative h-48 rounded-2xl overflow-hidden cursor-pointer border border-white/10 hover:border-white/30 transition-all hover:-translate-y-1 hover:shadow-2xl shadow-black/50"
                >
                  {/* Background Thumbnail */}
                  {plan.thumbnailBase64 ? (
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                      style={{ backgroundImage: `url("${plan.thumbnailBase64}")`, backgroundColor: '#1f2937' }}
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 to-purple-900 transition-transform duration-700 group-hover:scale-110 flex items-center justify-center p-4">
                       <span className="text-white/20 font-bold text-3xl text-center uppercase tracking-widest leading-none drop-shadow-md break-words">{plan.title}</span>
                    </div>
                  )}
                  {/* Top Middle Days Left Badge */}
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 w-full flex justify-center pointer-events-none">
                    {diffDays > 0 ? (
                      <span className="flex items-center gap-1.5 text-white bg-blue-500/80 backdrop-blur-md px-3 py-1 rounded-full border border-blue-400/50 shadow-lg text-xs font-bold tracking-widest uppercase">
                        {diffDays} Days Left
                      </span>
                    ) : diffDays === 0 ? (
                      <span className="flex items-center gap-1.5 text-white bg-orange-500/80 backdrop-blur-md px-3 py-1 rounded-full border border-orange-400/50 shadow-lg text-xs font-bold tracking-widest uppercase">
                        Due Today
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-white bg-red-500/80 backdrop-blur-md px-3 py-1 rounded-full border border-red-400/50 shadow-lg text-xs font-bold tracking-widest uppercase">
                        {Math.abs(diffDays)} Days Overdue
                      </span>
                    )}
                  </div>

                  {/* Gradient Overlay for text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />

                  <div className="absolute inset-0 p-5 flex flex-col justify-end">
                    <h4 className="text-xl font-bold text-white mb-1 line-clamp-1">{plan.title}</h4>

                    <div className="flex items-center flex-wrap gap-2 text-xs font-medium text-white/60 mb-3">
                      <span className="flex items-center gap-1"><Clock size={12} /> {plan.duration}</span>
                      <span className="flex items-center gap-1"><Calendar size={12} /> {parseLocalDate(plan.endDate)}</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden mb-1">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs font-medium text-white/70">
                      <span>{completed}/{total} Topics</span>
                      <span>{percent}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function AddPlanView({ onAdd, onCancel }: { onAdd: (plan: Plan) => void, onCancel: () => void }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [duration, setDuration] = useState('');
  const [endDate, setEndDate] = useState('');
  const [thumb, setThumb] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/thumbnails', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setThumb(data.url);
      } else {
        alert('Upload failed: ' + data.error);
      }
    } catch (err) {
      console.error('Failed to upload image', err);
      alert('Upload failed');
    }
    setLoading(false);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !category.trim() || !duration.trim() || !endDate) return;
    onAdd({
      id: Date.now().toString(),
      title: title.trim(),
      category: category.trim(),
      duration: duration.trim(),
      endDate: endDate,
      thumbnailBase64: thumb,
      subTopics: []
    });
  };

  return (
    <form onSubmit={submit} className="max-w-2xl mx-auto flex flex-col gap-6 animate-in slide-in-from-bottom-8 duration-500">

      <div className="flex flex-col gap-2">
        <label className="text-white/70 font-medium">Plan Title</label>
        <input
          required
          autoFocus
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="e.g. Master Dynamic Programming"
          className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition-colors placeholder:text-white/20"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-white/70 font-medium">Category</label>
        <input
          required
          list="category-suggestions"
          value={category}
          onChange={e => setCategory(e.target.value)}
          placeholder="e.g. DSA, Web Dev..."
          className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition-colors placeholder:text-white/20"
        />
        <datalist id="category-suggestions">
          {CATEGORY_SUGGESTIONS.map(cat => <option key={cat} value={cat} />)}
        </datalist>
      </div>

      <div className="flex gap-4">
        <div className="flex flex-col gap-2 flex-1">
          <label className="text-white/70 font-medium">Duration</label>
          <input
            required
            value={duration}
            onChange={e => setDuration(e.target.value)}
            placeholder="e.g. 30 Days, 2 Months..."
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition-colors placeholder:text-white/20"
          />
        </div>

        <div className="flex flex-col gap-2 flex-1 relative">
          <label className="text-white/70 font-medium flex justify-between">
            Target End Date
          </label>
          <CustomDatePicker value={endDate} onChange={setEndDate} />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-white/70 font-medium">Cover Thumbnail <span className="text-white/30 text-xs font-normal">(Optional)</span></label>
        <div className="flex items-center gap-4 bg-black/20 p-4 rounded-xl border border-white/10">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl transition-all text-white font-medium shadow-sm shrink-0"
          >
             <Upload size={18} /> {loading ? 'Uploading...' : 'Upload Image'}
          </button>
          
          {thumb ? (
            <div className="flex items-center gap-2 text-green-400 font-medium">
              <CheckCircle size={18} /> <span className="text-sm">Image uploaded successfully</span>
            </div>
          ) : (
            <span className="text-xs text-white/40 leading-tight">If skipped, the Plan Title will be used as a beautiful text fallback!</span>
          )}
        </div>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          className="hidden"
          onChange={handleImage}
        />
      </div>

      <div className="flex justify-end gap-3 mt-4">
        <button type="button" onClick={onCancel} className="px-6 py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/10 font-medium transition-colors">
          Cancel
        </button>
        <button type="submit" disabled={!title || !category || !duration || !endDate} className="px-8 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium transition-colors shadow-lg shadow-blue-500/20">
          Create Master Plan
        </button>
      </div>
    </form>
  );
}

function DetailView({ plan, onAddSub, onToggleSub, onDeleteSub, onDeletePlan }: { plan: Plan, onAddSub: (t: string) => void, onToggleSub: (id: string) => void, onDeleteSub: (id: string) => void, onDeletePlan: () => void }) {
  const { updatePlanDetails } = useDashboardStore();
  const [newSub, setNewSub] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editDuration, setEditDuration] = useState(plan.duration);
  const [editEndDate, setEditEndDate] = useState(plan.endDate);
  const checklistScrollRef = useRef<HTMLDivElement>(null);

  const scrollBy = (ref: React.RefObject<HTMLDivElement | null>, direction: 'up' | 'down') => {
    if (ref.current) {
      ref.current.scrollBy({ top: direction === 'up' ? -200 : 200, behavior: 'smooth' });
    }
  };

  const submitSub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSub.trim()) return;
    onAddSub(newSub.trim());
    setNewSub('');
  };

  const handleSaveDetails = () => {
    updatePlanDetails(plan.id, editDuration, editEndDate);
    setIsEditing(false);
  };

  const total = plan.subTopics.length;
  const completed = plan.subTopics.filter(st => st.completed).length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  const today = new Date();
  today.setHours(0,0,0,0);
  const targetDate = new Date(plan.endDate);
  targetDate.setHours(0,0,0,0);
  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return (
    <div className="max-w-4xl mx-auto flex gap-8 h-full animate-in slide-in-from-bottom-8 duration-500">
      {/* Left Column: Visuals & Progress */}
      <div className="w-1/3 flex flex-col gap-6 shrink-0">
        <div className="w-full aspect-square rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative">
          {plan.thumbnailBase64 ? (
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url("${plan.thumbnailBase64}")`, backgroundColor: '#1f2937' }} />
          ) : (
             <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 to-purple-900 flex items-center justify-center p-4">
               <span className="text-white/20 font-bold text-4xl text-center uppercase tracking-widest leading-none drop-shadow-md break-words">{plan.title}</span>
             </div>
          )}
          {/* Top Middle Days Left Badge */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 w-full flex justify-center pointer-events-none">
            {diffDays > 0 ? (
              <span className="flex items-center gap-2 text-white bg-blue-500/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-blue-400/50 shadow-lg text-sm font-bold tracking-widest uppercase">
                <Calendar size={14} /> {diffDays} Days Left
              </span>
            ) : diffDays === 0 ? (
              <span className="flex items-center gap-2 text-white bg-orange-500/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-orange-400/50 shadow-lg text-sm font-bold tracking-widest uppercase">
                <Clock size={14} /> Due Today
              </span>
            ) : (
              <span className="flex items-center gap-2 text-white bg-red-500/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-red-400/50 shadow-lg text-sm font-bold tracking-widest uppercase">
                <Clock size={14} /> {Math.abs(diffDays)} Days Overdue
              </span>
            )}
          </div>

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
          <div className="absolute bottom-4 left-4 right-4 text-center flex flex-col gap-2">
            <span className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-xs font-semibold text-white tracking-widest uppercase shadow-xl inline-block mx-auto border border-white/10">
              {plan.category}
            </span>
            {isEditing ? (
              <div className="flex flex-col gap-2 bg-black/80 backdrop-blur-md p-3 rounded-xl border border-white/20 shadow-2xl mt-2 relative z-50">
                <input
                  value={editDuration}
                  onChange={e => setEditDuration(e.target.value)}
                  placeholder="Duration..."
                  className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-xs outline-none focus:border-blue-500"
                />
                <input
                  value={editEndDate}
                  onChange={e => setEditEndDate(e.target.value)}
                  placeholder="e.g. 2026-12-31"
                  className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-xs outline-none focus:border-blue-500"
                />
                <div className="flex gap-2">
                  <button onClick={handleSaveDetails} className="flex-1 py-1.5 bg-blue-500 hover:bg-blue-600 rounded-lg text-white text-xs font-medium transition-colors">Save</button>
                  <button onClick={() => setIsEditing(false)} className="flex-1 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white/70 hover:text-white text-xs font-medium transition-colors">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="flex justify-center gap-2 flex-wrap group cursor-pointer" onClick={() => setIsEditing(true)} title="Click to edit">
                <span className="flex items-center gap-1 px-2 py-1 bg-black/60 group-hover:bg-black/80 backdrop-blur-md rounded-full text-[10px] font-medium text-white/80 border border-white/10 transition-colors">
                  <Clock size={10} /> {plan.duration}
                </span>
                <span className="flex items-center gap-1 px-2 py-1 bg-black/60 group-hover:bg-black/80 backdrop-blur-md rounded-full text-[10px] font-medium text-white/80 border border-white/10 transition-colors">
                  <Calendar size={10} /> {parseLocalDate(plan.endDate)}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-black/40 border border-white/10 rounded-3xl p-6 text-center">
          <div className="text-5xl font-bold text-white mb-2">{percent}%</div>
          <div className="text-white/50 text-sm tracking-widest uppercase mb-4">Completion</div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 rounded-full transition-all duration-1000 ease-out" style={{ width: `${percent}%` }} />
          </div>
          <div className="mt-3 text-sm text-white/40">{completed} of {total} topics conquered</div>
        </div>

        <button
          onClick={() => { if (confirm('Are you sure you want to delete this entire plan?')) onDeletePlan() }}
          className="mt-auto py-3 px-4 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/20 hover:border-red-500 transition-colors flex justify-center items-center gap-2 font-medium"
        >
          <Trash2 size={18} /> Drop Plan
        </button>
      </div>

      {/* Right Column: Interactive Checklist */}
      <div className="flex-1 flex flex-col bg-black/20 border border-white/10 rounded-3xl p-6 overflow-hidden relative">
        <h3 className="text-xl font-bold text-white/80 mb-6 flex items-center gap-2">
          <CheckCircle className="text-green-400" /> Action Items
        </h3>

        <div className="relative flex-1 overflow-hidden flex flex-col">
          <div
            ref={checklistScrollRef}
            className="flex-1 overflow-y-auto pr-2 flex flex-col gap-2 overscroll-contain [&::-webkit-scrollbar]:hidden"
            onWheel={e => { e.stopPropagation(); e.currentTarget.scrollTop += e.deltaY; }}
          >
            {plan.subTopics.length === 0 ? (
              <div className="h-full flex items-center justify-center text-white/30 italic text-center px-8">
                No action items yet. Break your ambitious plan down into small, conquerable steps below!
              </div>
            ) : (
              plan.subTopics.map(st => (
                <div
                  key={st.id}
                  onClick={() => onToggleSub(st.id)}
                  className={`group flex items-center gap-4 p-4 rounded-2xl cursor-pointer border border-transparent hover:border-white/10 transition-all ${st.completed ? 'bg-white/5 opacity-60' : 'bg-black/40 shadow-lg'}`}
                >
                  <div className={`shrink-0 transition-colors ${st.completed ? 'text-green-500' : 'text-white/20 group-hover:text-white/50'}`}>
                    {st.completed ? <CheckCircle size={24} /> : <Circle size={24} />}
                  </div>
                  <span className={`flex-1 text-lg transition-all ${st.completed ? 'text-white/50 line-through' : 'text-white/90'}`}>
                    {st.title}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDeleteSub(st.id); }}
                    className="opacity-0 group-hover:opacity-100 p-2 text-white/30 hover:text-red-400 hover:bg-white/10 rounded-xl transition-all shrink-0"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Tiny Scroll Arrows */}
          <div className="absolute inset-x-0 top-0 bottom-0 flex flex-col justify-between items-center pointer-events-none">
            <button onMouseDown={(e) => e.preventDefault()} onClick={() => scrollBy(checklistScrollRef, 'up')} className="pointer-events-auto flex items-center justify-center w-12 h-5 bg-blue-500/80 hover:bg-blue-500 border-x border-b border-blue-400/50 rounded-b-xl text-white backdrop-blur-md transition-all shadow-[0_0_10px_rgba(59,130,246,0.5)]"><ChevronUp size={16} strokeWidth={3} /></button>
            <button onMouseDown={(e) => e.preventDefault()} onClick={() => scrollBy(checklistScrollRef, 'down')} className="pointer-events-auto flex items-center justify-center w-12 h-5 bg-blue-500/80 hover:bg-blue-500 border-x border-t border-blue-400/50 rounded-t-xl text-white backdrop-blur-md transition-all shadow-[0_0_10px_rgba(59,130,246,0.5)]"><ChevronDown size={16} strokeWidth={3} /></button>
          </div>
        </div>

        <form onSubmit={submitSub} className="mt-4 pt-4 border-t border-white/10">
          <div className="relative">
            <input
              value={newSub}
              onChange={e => setNewSub(e.target.value)}
              placeholder="Add a new sub-topic..."
              className="w-full bg-black/40 border border-white/10 rounded-2xl pl-5 pr-14 py-4 text-white outline-none focus:border-blue-500 transition-colors placeholder:text-white/30"
            />
            <button
              type="submit"
              disabled={!newSub.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-500 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors shadow-lg"
            >
              <Plus size={20} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CustomSelect({ value, onChange, options }: { value: string, onChange: (val: string) => void, options: string[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative" ref={ref}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 cursor-pointer bg-transparent text-white hover:text-white/80 transition-colors"
      >
        <span>{value === 'All' ? 'All Categories' : value}</span>
        <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-gray-900 border border-white/20 rounded-xl shadow-2xl overflow-hidden z-[100] animate-in slide-in-from-top-2">
          {options.map(opt => (
            <div
              key={opt}
              onClick={() => { onChange(opt); setIsOpen(false); }}
              className={`px-4 py-2 cursor-pointer transition-colors ${value === opt ? 'bg-blue-500 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
            >
              {opt === 'All' ? 'All Categories' : opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CustomDatePicker({ value, onChange }: { value: string, onChange: (date: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(() => value ? new Date(value) : new Date());
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const handleSelect = (day: number) => {
    const y = currentDate.getFullYear();
    const m = String(currentDate.getMonth() + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    onChange(`${y}-${m}-${d}`);
    setIsOpen(false);
  };

  const prevMonth = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <div className="relative w-full z-50">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white cursor-pointer hover:border-blue-500 transition-colors flex items-center justify-between"
      >
        <span className={value ? "text-white" : "text-white/20"}>
          {value || "Select a date..."}
        </span>
        <Calendar size={18} className="text-white/40" />
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center pointer-events-auto">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
            onClick={() => setIsOpen(false)} 
          />
          
          <div ref={popupRef} className="relative w-80 bg-gray-900 border border-white/20 rounded-3xl shadow-2xl p-5 z-10 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <button onClick={prevMonth} className="p-2 hover:bg-white/10 rounded-xl text-white/70 hover:text-white transition-colors">
                <ChevronLeft size={20} />
              </button>
              <div className="text-white font-semibold text-lg tracking-wide">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </div>
              <button onClick={nextMonth} className="p-2 hover:bg-white/10 rounded-xl text-white/70 hover:text-white transition-colors">
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1 text-center mb-3">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                <div key={d} className="text-xs font-bold text-white/40 tracking-wider uppercase">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`blank-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const isSelected = value === `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

                return (
                  <button
                    key={day}
                    onClick={(e) => { e.preventDefault(); handleSelect(day); }}
                    className={`h-9 w-9 rounded-full text-sm font-medium transition-all mx-auto flex items-center justify-center
                      ${isSelected ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
