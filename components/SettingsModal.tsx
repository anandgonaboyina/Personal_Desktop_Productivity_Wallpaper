'use client';

import { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useDashboardStore } from '@/store/dashboardStore';
import { X, Upload, Trash2, Image as ImageIcon, Settings as SettingsIcon, MonitorPlay, Clock, Users, Plus, Eye, EyeOff, Download, UploadCloud, Activity, MessageSquare, Timer as TimerIcon, Hourglass, Film, User, BadgeCheck, Send, Briefcase, Calendar, CheckSquare, Flame, ChevronUp, ChevronDown, Database } from 'lucide-react';

const DEFAULT_WALLPAPERS = [
  'itachi-uchiha.png', 'kakashi.mp4', 'kakashi2.mp4', 'kakashi3.png',
  'kakashiChild.jpg', 'naruto.webp', 'RockLee.mp4', 'squa7.jpg', 'demonslayer1.mp4'
];

export default function SettingsModal() {
  const { isSettingsOpen, toggleSettings, is24HourClock, toggle24HourClock, currentBgSrc, hiddenWallpapers, toggleWallpaperVisibility, showHealth, showQuote, showTimer, showCountdowns, showVideoControls, showClock, showTasks, showCalendar, showTodayWork, toggleVisibility, isSlideshowEnabled, setIsSlideshowEnabled, slideshowIntervalMins, setSlideshowIntervalMins, lockedWidgets, toggleWidgetLock, resetAllOffsets, clearOldData, clearAllData, lockedWallpaper, setLockedWallpaper } = useDashboardStore();
  const [activeTab, setActiveTab] = useState<'wallpapers' | 'preferences' | 'profiles' | 'data' | 'about'>('wallpapers');
  const [coffeeAmount, setCoffeeAmount] = useState<number>(20);
  const [deleteDays, setDeleteDays] = useState<number>(60);
  const upiId = 'gonaboyinaanandkumar@ybl';

  const [wallpapers, setWallpapers] = useState<{ type: string, src: string, filename: string }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const settingsScrollRef = useRef<HTMLDivElement>(null);

  const scrollBy = (ref: React.RefObject<HTMLDivElement | null>, direction: 'up' | 'down') => {
    if (ref.current) {
      ref.current.scrollBy({ top: direction === 'up' ? -300 : 300, behavior: 'smooth' });
    }
  };

  const [profiles, setProfiles] = useState<{ id: number, name: string }[]>([]);
  const [newProfileName, setNewProfileName] = useState('');
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  const activeProfileId = typeof window !== 'undefined' ? localStorage.getItem('dashboard-active-profile') || '1' : '1';

  const fetchWallpapers = async () => {
    try {
      const res = await fetch('/api/wallpapers');
      const data = await res.json();
      if (data.backgrounds) {
        setWallpapers(data.backgrounds);
      }
    } catch (err) {
      console.error('Failed to fetch wallpapers', err);
    }
  };

  const fetchProfiles = async () => {
    try {
      const res = await fetch('/api/profiles');
      const data = await res.json();
      if (data.profiles) {
        setProfiles(data.profiles);
      }
    } catch (err) {
      console.error('Failed to fetch profiles', err);
    }
  };

  useEffect(() => {
    if (isSettingsOpen) {
      fetchWallpapers();
      fetchProfiles();
    }
  }, [isSettingsOpen]);

  const handleSwitchProfile = (id: number) => {
    localStorage.setItem('dashboard-active-profile', id.toString());
    window.location.reload();
  };

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfileName.trim()) return;

    setIsCreatingProfile(true);
    try {
      const res = await fetch('/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newProfileName.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setNewProfileName('');
        await fetchProfiles();
        handleSwitchProfile(data.profile.id);
      } else {
        alert('Failed: ' + data.error);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to create profile');
    } finally {
      setIsCreatingProfile(false);
    }
  };

  const handleDeleteProfile = async (id: number, name: string) => {
    if (id === 1) return;
    if (!confirm(`Are you sure you want to delete profile "${name}"? This will permanently delete all its tasks, notes, health history, and stats.`)) return;

    try {
      const res = await fetch('/api/profiles', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.success) {
        // If the user deleted the profile they are currently on, switch back to Default (1)
        if (activeProfileId === id.toString()) {
          handleSwitchProfile(1);
        } else {
          await fetchProfiles();
        }
      } else {
        alert('Delete failed: ' + data.error);
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Delete failed');
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/wallpapers', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        await fetchWallpapers();
        window.dispatchEvent(new Event('wallpapers-updated'));
      } else {
        alert('Upload failed: ' + data.error);
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert('Upload failed');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (filename: string) => {
    if (!confirm(`Are you sure you want to delete ${filename}?`)) return;

    try {
      const res = await fetch('/api/wallpapers', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchWallpapers();
        window.dispatchEvent(new Event('wallpapers-updated'));
      } else {
        alert('Delete failed: ' + data.error);
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Delete failed');
    }
  };

  const handleExportData = () => {
    try {
      const activeProfileName = profiles.find(p => p.id.toString() === activeProfileId)?.name || `profile-${activeProfileId}`;
      const exportUrl = `/api/export?profileId=${activeProfileId}&name=${encodeURIComponent(activeProfileName)}`;
      window.open(exportUrl, '_blank');
    } catch (err) {
      console.error(err);
      alert('Failed to export data');
    }
  };

  const handleImportData = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm('Are you sure? This will OVERWRITE your current profile data with the imported file.')) {
      e.target.value = '';
      return;
    }

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);

      // Strict safety check: Ensure it's a valid Zustand backup file
      if (typeof parsed !== 'object' || parsed === null || !('state' in parsed)) {
        alert('Invalid backup file. Missing required dashboard data structure.');
        e.target.value = '';
        return;
      }

      const res = await fetch('/api/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileId: activeProfileId, data: parsed })
      });

      if (res.ok) {
        alert('Import successful! Reloading...');
        window.location.reload();
      } else {
        alert('Import failed. Server rejected the data.');
      }
    } catch (err) {
      console.error(err);
      alert('Invalid JSON file format.');
    }
    e.target.value = '';
  };

  if (!isSettingsOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 pointer-events-auto">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={toggleSettings}
      />

      <div className="relative w-full max-w-4xl max-h-[85vh] flex flex-col bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-3xl overflow-hidden text-white animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-black/20">
          <h2 className="text-2xl font-bold tracking-wide flex items-center gap-3">
            <SettingsIcon className="text-blue-400" />
            Dashboard Settings
          </h2>
          <button
            onClick={toggleSettings}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white/60 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Tabs */}
          <div className="w-64 bg-black/20 border-r border-white/10 p-4 flex flex-col gap-2">
            <button
              onClick={() => setActiveTab('wallpapers')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === 'wallpapers' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'text-white/60 hover:bg-white/5 hover:text-white border border-transparent'}`}
            >
              <ImageIcon size={20} />
              Wallpapers
            </button>
            <button
              onClick={() => setActiveTab('preferences')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === 'preferences' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'text-white/60 hover:bg-white/5 hover:text-white border border-transparent'}`}
            >
              <MonitorPlay size={20} />
              Preferences
            </button>
            <button
              onClick={() => setActiveTab('profiles')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === 'profiles' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'text-white/60 hover:bg-white/5 hover:text-white border border-transparent'}`}
            >
              <Users size={20} />
              Workspaces
            </button>
            <button
              onClick={() => setActiveTab('data')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === 'data' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'text-white/60 hover:bg-white/5 hover:text-white border border-transparent'}`}
            >
              <Database size={20} />
              Data & Backup
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`flex flex-col items-center justify-center gap-2 px-4 py-6 rounded-2xl transition-all font-medium mt-auto w-full ${activeTab === 'about' ? 'bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-white border border-blue-500/30 shadow-lg' : 'bg-black/20 text-white/60 hover:bg-white/5 hover:text-white border border-white/5'}`}
            >
              <img
                src="/branding/author.jpeg"
                alt="Developer"
                className="w-14 h-14 rounded-full object-cover shadow-lg border-2 border-white/20"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement?.insertAdjacentHTML('afterbegin', '<svg class="w-8 h-8" ... />'); // Fallback to User icon
                }}
              />
              <div className="flex flex-col items-center text-center">
                <span className="text-sm font-semibold tracking-wide leading-tight">Support & Connect</span>
                <span className="text-[10px] text-blue-300 font-medium uppercase mt-1 tracking-wider">Gonaboyina Anand kumar</span>
              </div>
            </button>
          </div>

          {/* Content Area */}
          <div className="relative flex-1 overflow-hidden flex flex-col">
            <div
              ref={settingsScrollRef}
              className="flex-1 overflow-y-auto p-6 [&::-webkit-scrollbar]:hidden"
              onWheel={(e) => { e.stopPropagation(); e.currentTarget.scrollTop += e.deltaY; }}
            >

              {activeTab === 'profiles' && (
                <div className="flex flex-col gap-6">
                  <div>
                    <h3 className="text-xl font-semibold">Workspaces</h3>
                    <p className="text-white/50 text-sm mt-1">Switch between different isolated environments. Perfect for creating a temporary workspace without touching your main dashboard setup.</p>
                  </div>

                  <div className="flex flex-col gap-4">
                    <h4 className="font-medium text-lg border-b border-white/10 pb-2">Existing Workspaces</h4>
                    <div className="grid gap-3">
                      {profiles.map((p) => {
                        const isActive = p.id.toString() === activeProfileId;
                        return (
                          <div key={p.id} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${isActive ? 'bg-blue-500/10 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.1)]' : 'bg-black/20 border-white/5 hover:border-white/20'}`}>
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${isActive ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/70'}`}>
                                {p.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-semibold text-lg">{p.name}</p>
                                {isActive && <span className="text-xs text-blue-400 font-medium tracking-widest uppercase">Current Active</span>}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {!isActive && (
                                <button
                                  onClick={() => handleSwitchProfile(p.id)}
                                  className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-medium transition-colors border border-white/10"
                                >
                                  Switch Workspace
                                </button>
                              )}
                              {p.id !== 1 && (
                                <button
                                  onClick={() => handleDeleteProfile(p.id, p.name)}
                                  className="p-2 bg-red-500/20 hover:bg-red-500/80 text-red-300 hover:text-white rounded-xl transition-colors border border-red-500/30 hover:border-red-500"
                                  title="Delete Workspace"
                                >
                                  <Trash2 size={18} />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 mt-4">
                    <h4 className="font-medium text-lg border-b border-white/10 pb-2">Create New Workspace</h4>
                    <form onSubmit={handleCreateProfile} className="flex gap-3">
                      <input
                        type="text"
                        placeholder="e.g. Work Context, John Doe..."
                        value={newProfileName}
                        onChange={(e) => setNewProfileName(e.target.value)}
                        className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:bg-white/5 focus:border-white/30 transition-all placeholder:text-white/30"
                      />
                      <button
                        type="submit"
                        disabled={isCreatingProfile || !newProfileName.trim()}
                        className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white px-6 py-3 rounded-xl transition-colors font-medium shadow-lg"
                      >
                        {isCreatingProfile ? <span className="animate-spin">↻</span> : <Plus size={20} />}
                        Create & Switch
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {activeTab === 'wallpapers' && (
                <div className="flex flex-col gap-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-semibold">Background Media</h3>
                      <p className="text-white/50 text-sm mt-1">Manage photos and videos for your dynamic wallpaper cycle.</p>
                    </div>

                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*,video/mp4,video/webm"
                      onChange={handleFileChange}
                    />
                    <button
                      onClick={handleUploadClick}
                      disabled={isUploading}
                      className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white px-4 py-2 rounded-xl transition-colors font-medium shadow-lg"
                    >
                      {isUploading ? <span className="animate-spin text-xl">↻</span> : <Upload size={18} />}
                      {isUploading ? 'Uploading...' : 'Upload Media'}
                    </button>
                  </div>

                  {/* Slideshow Mode */}
                  <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-2xl bg-black/20 border border-white/5 gap-4">
                    <div>
                      <h4 className="font-medium text-lg">Slideshow Mode</h4>
                      <p className="text-sm text-white/50">Automatically cycle through visible wallpapers.</p>
                    </div>
                    <div className="flex items-center gap-4">
                      {isSlideshowEnabled && (
                        <select
                          value={slideshowIntervalMins}
                          onChange={(e) => setSlideshowIntervalMins(Number(e.target.value))}
                          className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
                        >
                          <option value={1}>Every 1 Minute</option>
                          <option value={5}>Every 5 Minutes</option>
                          <option value={10}>Every 10 Minutes</option>
                          <option value={30}>Every 30 Minutes</option>
                          <option value={60}>Every 1 Hour</option>
                        </select>
                      )}
                      <button onClick={() => setIsSlideshowEnabled(!isSlideshowEnabled)} className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${isSlideshowEnabled ? 'bg-blue-500' : 'bg-white/20'}`}>
                        <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${isSlideshowEnabled ? 'translate-x-8' : 'translate-x-1'}`} />
                      </button>
                    </div>
                  </div>


                  {/* Default Wallpapers */}
                  <div>
                    <h4 className="font-medium text-lg mb-3 border-b border-white/10 pb-2">Default Wallpapers</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {wallpapers.filter(bg => DEFAULT_WALLPAPERS.includes(bg.filename)).map((bg) => {
                        const isActive = currentBgSrc === bg.src;
                        const isDefault = DEFAULT_WALLPAPERS.includes(bg.filename);
                        const isHidden = hiddenWallpapers.includes(bg.filename);

                        return (
                          <div 
                            key={bg.filename} 
                            onClick={() => setLockedWallpaper(bg.filename)}
                            className={`relative cursor-pointer group aspect-video rounded-xl overflow-hidden bg-black/40 border-2 transition-all ${isActive ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'border-white/10 hover:border-white/30'} ${isHidden ? 'opacity-40 grayscale' : ''}`}
                          >
                            {bg.type === 'image' ? (
                              <img src={bg.src} alt={bg.filename} className="w-full h-full object-cover" />
                            ) : (
                              <video src={bg.src} className="w-full h-full object-cover" />
                            )}

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-medium truncate text-white/90 drop-shadow-md pr-2">{bg.filename}</span>
                                {isDefault ? (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleWallpaperVisibility(bg.filename);
                                      window.dispatchEvent(new Event('wallpapers-updated')); // Sync background
                                    }}
                                    className={`p-1.5 rounded-lg transition-colors shrink-0 backdrop-blur-md ${isHidden ? 'bg-white/20 hover:bg-white/40 text-white' : 'bg-white/10 hover:bg-white/30 text-white'}`}
                                    title={isHidden ? "Show wallpaper" : "Hide wallpaper"}
                                  >
                                    {isHidden ? <EyeOff size={14} /> : <Eye size={14} />}
                                  </button>
                                ) : (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDelete(bg.filename);
                                    }}
                                    className="p-1.5 bg-red-500/80 hover:bg-red-500 text-white rounded-lg transition-colors shrink-0 backdrop-blur-md"
                                    title="Delete wallpaper permanently"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                )}
                              </div>
                            </div>
                            {isActive && (
                              <div className="absolute top-2 left-2 bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg">
                                ACTIVE
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Custom Wallpapers */}
                  <div>
                    <h4 className="font-medium text-lg mb-3 border-b border-white/10 pb-2">Custom Uploads</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {wallpapers.filter(bg => !DEFAULT_WALLPAPERS.includes(bg.filename)).map((bg) => {
                        const isActive = currentBgSrc === bg.src;
                        const isHidden = hiddenWallpapers.includes(bg.filename);

                        return (
                          <div 
                            key={bg.filename} 
                            onClick={() => setLockedWallpaper(bg.filename)}
                            className={`relative cursor-pointer group aspect-video rounded-xl overflow-hidden bg-black/40 border-2 transition-all ${isActive ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'border-white/10 hover:border-white/30'} ${isHidden ? 'opacity-40 grayscale' : ''}`}
                          >
                            {bg.type === 'image' ? (
                              <img src={bg.src} alt={bg.filename} className="w-full h-full object-cover" />
                            ) : (
                              <video src={bg.src} className="w-full h-full object-cover" />
                            )}

                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-medium truncate text-white/90 drop-shadow-md pr-2">{bg.filename}</span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(bg.filename);
                                  }}
                                  className="p-1.5 bg-red-500/80 hover:bg-red-500 text-white rounded-lg transition-colors shrink-0 backdrop-blur-md"
                                  title="Delete wallpaper permanently"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                            {isActive && (
                              <div className="absolute top-2 left-2 bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg">
                                ACTIVE
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {wallpapers.filter(bg => !DEFAULT_WALLPAPERS.includes(bg.filename)).length === 0 && (
                        <div className="col-span-full py-8 text-center text-white/40 border-2 border-dashed border-white/10 rounded-2xl">
                          No custom wallpapers found. Upload some to get started!
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'preferences' && (
                <div className="flex flex-col gap-6">
                  <div>
                    <h3 className="text-xl font-semibold">General Preferences</h3>
                    <p className="text-white/50 text-sm mt-1">Customize how your dashboard looks and feels.</p>
                  </div>

                  <div className="flex flex-col gap-4">
                    {/* Toggle 24-hour clock */}
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-black/20 border border-white/5">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/5 rounded-xl">
                          <Clock size={24} className="text-blue-300" />
                        </div>
                        <div>
                          <h4 className="font-medium text-lg">24-Hour Clock Format</h4>
                          <p className="text-sm text-white/50">Use military time (e.g., 14:00 instead of 2:00 PM)</p>
                        </div>
                      </div>
                      <button
                        onClick={toggle24HourClock}
                        className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${is24HourClock ? 'bg-blue-500' : 'bg-white/20'}`}
                      >
                        <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${is24HourClock ? 'translate-x-8' : 'translate-x-1'}`} />
                      </button>
                    </div>



                    {/* Widget Layout & Positioning */}
                    <div className="flex flex-col p-4 rounded-2xl bg-black/20 border border-white/5 mt-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-lg">Widget Layout & Positioning</h4>
                        <button
                          onClick={() => {
                            if (currentBgSrc) resetAllOffsets(currentBgSrc);
                          }}
                          className="px-4 py-1.5 bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white rounded-xl transition-colors border border-red-500/30 font-medium text-sm"
                        >
                          Reset Default Positions
                        </button>
                      </div>
                      <p className="text-sm text-white/50 mb-4">Lock the drag position of specific elements on your dashboard.</p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Lock Clock */}
                        <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                          <div className="flex items-center gap-3">
                            <Clock size={18} className="text-blue-300" />
                            <span className="text-sm font-medium">Lock Clock</span>
                          </div>
                          <button onClick={() => toggleWidgetLock('clock')} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${lockedWidgets.includes('clock') ? 'bg-blue-500' : 'bg-white/20'}`}>
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${lockedWidgets.includes('clock') ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                        </div>

                        {/* Lock Tasks */}
                        <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                          <div className="flex items-center gap-3">
                            <CheckSquare size={18} className="text-green-400" />
                            <span className="text-sm font-medium">Lock Tasks</span>
                          </div>
                          <button onClick={() => toggleWidgetLock('tasks')} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${lockedWidgets.includes('tasks') ? 'bg-blue-500' : 'bg-white/20'}`}>
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${lockedWidgets.includes('tasks') ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                        </div>

                        {/* Lock Quote */}
                        <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                          <div className="flex items-center gap-3">
                            <MessageSquare size={18} className="text-yellow-400" />
                            <span className="text-sm font-medium">Lock Quote</span>
                          </div>
                          <button onClick={() => toggleWidgetLock('quote')} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${lockedWidgets.includes('quote') ? 'bg-blue-500' : 'bg-white/20'}`}>
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${lockedWidgets.includes('quote') ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                        </div>

                        {/* Lock Countdowns */}
                        <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                          <div className="flex items-center gap-3">
                            <Hourglass size={18} className="text-purple-400" />
                            <span className="text-sm font-medium">Lock Target Countdowns</span>
                          </div>
                          <button onClick={() => toggleWidgetLock('countdowns')} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${lockedWidgets.includes('countdowns') ? 'bg-blue-500' : 'bg-white/20'}`}>
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${lockedWidgets.includes('countdowns') ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Widget Visibility */}
                    <div className="flex flex-col p-4 rounded-2xl bg-black/20 border border-white/5 mt-4">
                      <h4 className="font-medium text-lg mb-4">Widget Visibility</h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Health Rings */}
                        <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                          <div className="flex items-center gap-3">
                            <Activity size={18} className="text-red-400" />
                            <span className="text-sm font-medium">Health Rings</span>
                          </div>
                          <button onClick={() => toggleVisibility('showHealth')} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${showHealth ? 'bg-blue-500' : 'bg-white/20'}`}>
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showHealth ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                        </div>

                        {/* Quote */}
                        <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                          <div className="flex items-center gap-3">
                            <MessageSquare size={18} className="text-purple-400" />
                            <span className="text-sm font-medium">Daily Quote</span>
                          </div>
                          <button onClick={() => toggleVisibility('showQuote')} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${showQuote ? 'bg-blue-500' : 'bg-white/20'}`}>
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showQuote ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                        </div>

                        {/* Timer */}
                        <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                          <div className="flex items-center gap-3">
                            <TimerIcon size={18} className="text-yellow-400" />
                            <span className="text-sm font-medium">Session Timer</span>
                          </div>
                          <button onClick={() => toggleVisibility('showTimer')} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${showTimer ? 'bg-blue-500' : 'bg-white/20'}`}>
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showTimer ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                        </div>

                        {/* Countdowns */}
                        <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                          <div className="flex items-center gap-3">
                            <Hourglass size={18} className="text-blue-400" />
                            <span className="text-sm font-medium">Target Countdowns</span>
                          </div>
                          <button onClick={() => toggleVisibility('showCountdowns')} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${showCountdowns ? 'bg-blue-500' : 'bg-white/20'}`}>
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showCountdowns ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                        </div>

                        {/* Video Controls */}
                        <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                          <div className="flex items-center gap-3">
                            <Film size={18} className="text-green-400" />
                            <span className="text-sm font-medium">Video Controls</span>
                          </div>
                          <button onClick={() => toggleVisibility('showVideoControls')} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${showVideoControls ? 'bg-blue-500' : 'bg-white/20'}`}>
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showVideoControls ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                        </div>

                        {/* Clock */}
                        <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                          <div className="flex items-center gap-3">
                            <Clock size={18} className="text-cyan-400" />
                            <span className="text-sm font-medium">Clock</span>
                          </div>
                          <button onClick={() => toggleVisibility('showClock')} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${showClock ? 'bg-blue-500' : 'bg-white/20'}`}>
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showClock ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                        </div>

                        {/* Today's Focus */}
                        <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                          <div className="flex items-center gap-3">
                            <Flame size={18} className="text-orange-400" />
                            <span className="text-sm font-medium">Today's Focus</span>
                          </div>
                          <button onClick={() => toggleVisibility('showTodayWork')} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${showTodayWork ? 'bg-blue-500' : 'bg-white/20'}`}>
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showTodayWork ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                        </div>

                        {/* Tasks */}
                        <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                          <div className="flex items-center gap-3">
                            <CheckSquare size={18} className="text-orange-400" />
                            <span className="text-sm font-medium">Tasks</span>
                          </div>
                          <button onClick={() => toggleVisibility('showTasks')} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${showTasks ? 'bg-blue-500' : 'bg-white/20'}`}>
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showTasks ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                        </div>

                        {/* Calendar */}
                        <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                          <div className="flex items-center gap-3">
                            <Calendar size={18} className="text-pink-400" />
                            <span className="text-sm font-medium">Calendar</span>
                          </div>
                          <button onClick={() => toggleVisibility('showCalendar')} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${showCalendar ? 'bg-blue-500' : 'bg-white/20'}`}>
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showCalendar ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'data' && (
                <div className="flex flex-col gap-6">
                  <div>
                    <h3 className="text-xl font-semibold">Data & Backup</h3>
                    <p className="text-white/50 text-sm mt-1">Export, import, or backup your dashboard data locally.</p>
                  </div>

                  <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-2xl">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        <Activity size={20} className="text-blue-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-blue-300">Important Recommendation</h4>
                        <p className="text-sm text-white/80 mt-1 leading-relaxed">
                          Please remember to backup your data regularly.
                          <br /><br />
                          If you want to import or share plans with friends or coworkers, it's highly recommended to <strong>create and switch to a separate User Profile</strong> before importing. This prevents accidentally overwriting your main default user data!
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    {/* Backup & Restore */}
                    <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-2xl bg-black/20 border border-white/5 gap-4">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/5 rounded-xl">
                          <UploadCloud size={24} className="text-green-400" />
                        </div>
                        <div>
                          <h4 className="font-medium text-lg">Backup & Restore</h4>
                          <p className="text-sm text-white/50">Export or import your dashboard data locally.</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleExportData}
                          className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-medium transition-colors border border-white/10 flex items-center gap-2"
                        >
                          <Download size={16} /> Export
                        </button>

                        <label className="cursor-pointer px-4 py-2 bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 rounded-xl text-sm font-medium transition-colors border border-blue-500/30 flex items-center gap-2">
                          <Upload size={16} /> Import
                          <input type="file" className="hidden" accept=".json" onChange={handleImportData} />
                        </label>
                      </div>
                    </div>
                    
                    {/* Clear Old Data */}
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 rounded-2xl bg-black/20 border border-white/5 gap-5">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="p-3 bg-white/5 rounded-xl shrink-0">
                          <Trash2 size={24} className="text-yellow-400" />
                        </div>
                        <div className="flex flex-col gap-2">
                          <div>
                            <h4 className="font-medium text-lg leading-tight">Clear Old Data</h4>
                            <p className="text-sm text-white/50 mt-1">Delete health and history logs older than the selected timeframe.</p>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 mt-1">
                            {[15, 30, 60, 90, 120].map(days => (
                              <button
                                key={days}
                                onClick={() => setDeleteDays(days)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                                  deleteDays === days 
                                    ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50 scale-105' 
                                    : 'bg-black/40 text-white/50 border-white/5 hover:border-white/20 hover:text-white'
                                }`}
                              >
                                {days} Days
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={async () => {
                          if (confirm(`Are you sure you want to delete all history logs older than ${deleteDays} days? This action cannot be undone.`)) {
                            await clearOldData(deleteDays);
                            alert(`Logs older than ${deleteDays} days cleared successfully.`);
                          }
                        }}
                        className="w-full md:w-auto px-5 py-3 bg-yellow-500/20 hover:bg-yellow-500/40 text-yellow-300 rounded-xl text-sm font-bold transition-all border border-yellow-500/30 flex items-center justify-center gap-2 whitespace-nowrap shrink-0 hover:scale-105"
                      >
                        <Trash2 size={18} /> Delete Logs
                      </button>
                    </div>

                    {/* Danger Zone: Delete All Data */}
                    <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-2xl bg-red-500/10 border border-red-500/30 gap-4">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-red-500/20 rounded-xl">
                          <Trash2 size={24} className="text-red-400" />
                        </div>
                        <div>
                          <h4 className="font-medium text-lg text-red-300">Factory Reset Profile</h4>
                          <p className="text-sm text-white/60">Permanently delete ALL tasks, notes, health, and history for this profile.</p>
                        </div>
                      </div>
                      <button
                        onClick={async () => {
                          const userTyped = prompt('Type "delete all" to confirm resetting all data for this profile:');
                          if (userTyped?.toLowerCase() === 'delete all') {
                            await clearAllData();
                          } else if (userTyped !== null) {
                            alert('Confirmation failed. Data was not deleted.');
                          }
                        }}
                        className="px-4 py-2 bg-red-500/20 hover:bg-red-500/80 text-red-300 hover:text-white rounded-xl text-sm font-medium transition-colors border border-red-500/50 flex items-center gap-2 whitespace-nowrap"
                      >
                        <Trash2 size={16} /> Reset All Data
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'about' && (
                <div className="flex flex-col gap-6">
                  <div>
                    <h3 className="text-xl font-semibold">About Developer</h3>
                    <p className="text-white/50 text-sm mt-1">Creator and maintainer of the Productivity Dashboard.</p>
                  </div>

                  <div className="flex flex-col md:flex-row items-center md:items-start gap-6 bg-black/20 border border-white/10 rounded-3xl p-3 relative overflow-hidden">
                    {/* Decorative Gradient Blob */}
                    <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-500/20 blur-3xl rounded-full mix-blend-screen pointer-events-none" />

                    <div className="w-28 h-28 shrink-0 relative rounded-full overflow-hidden border-4 border-white/10 shadow-2xl">
                      <img
                        src="/branding/author.jpeg"
                        alt="Gonaboyina Anand kumar"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement!.innerHTML = '<div class="w-full h-full bg-blue-500 flex items-center justify-center text-4xl font-bold">AK</div>';
                        }}
                      />
                    </div>

                    <div className="flex flex-col flex-1 items-center md:items-start text-center md:text-left z-10 w-full">
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">Gonaboyina Anand kumar</h2>
                        <BadgeCheck className="text-blue-400 shrink-0" size={20} />
                      </div>

                      <p className="text-blue-300 font-medium tracking-wide uppercase text-[11px] mb-2">Full Stack MERN Developer</p>

                      <p className="text-[12px] text-white/60 mb-5 leading-relaxed max-w-sm">
                        Have any suggestions, feature requests, or found a bug? Feel free to send them to me directly on Telegram!
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full mb-6">
                        <a
                          href="https://t.me/gAnandKumar"
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-3 transition-all hover:scale-105"
                        >
                          <div className="p-2 bg-[#0088cc]/20 rounded-xl shrink-0">
                            <Send size={18} className="text-[#0088cc]" />
                          </div>
                          <div className="flex flex-col items-start min-w-0">
                            <span className="text-[11px] text-white/50 w-full text-left">Telegram</span>
                            <span className="font-semibold text-xs w-full text-left">@gAnandKumar</span>
                          </div>
                        </a>

                        <a
                          href="https://t.me/FstackWebDevRise"
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-3 transition-all hover:scale-105"
                        >
                          <div className="p-2 bg-[#0088cc]/20 rounded-xl shrink-0">
                            <Users size={18} className="text-[#0088cc]" />
                          </div>
                          <div className="flex flex-col items-start min-w-0">
                            <span className="text-[11px] text-white/50 w-full text-left leading-tight">Dev Channel</span>
                            <span className="font-semibold text-xs w-full text-left leading-tight">FstackWebDevRise</span>
                          </div>
                        </a>

                        <a
                          href="https://my-portfolio-git-main-anandgonaboyinas-projects.vercel.app/"
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-3 transition-all hover:scale-105 sm:col-span-2"
                        >
                          <div className="p-2 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl shrink-0">
                            <Briefcase size={18} className="text-purple-400" />
                          </div>
                          <div className="flex flex-col items-start min-w-0 w-full">
                            <span className="text-[11px] text-white/50 w-full text-left">Portfolio</span>
                            <span className="font-semibold text-xs w-full text-left leading-tight">View my Other projects & work</span>
                          </div>
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Support Section */}
                  <div className="w-full bg-black/20 border border-white/10 rounded-3xl p-6 relative overflow-hidden">
                    <h4 className="text-xl font-bold mb-1 text-white">Buy me a coffee ☕</h4>
                    <p className="text-sm text-white/60 mb-5 leading-relaxed">
                      It took a lot of time and effort to build and maintain this dashboard.
                      If you find it mostly helpful, your support goes a long way in keeping this project alive and continuously improving!
                    </p>

                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 mt-2">
                      <div className="flex flex-col items-center shrink-0">
                        <div className="bg-white p-3 rounded-2xl shadow-[0_0_30px_rgba(59,130,246,0.3)]">
                          <QRCodeSVG
                            value={`upi://pay?pa=${upiId}&pn=Gonaboyina%20Anand%20kumar&am=${coffeeAmount}&cu=INR`}
                            size={140}
                            level="M"
                            includeMargin={false}
                          />
                        </div>
                        <span className="text-sm text-blue-300 uppercase tracking-[0.2em] mt-3 font-black bg-blue-500/20 px-4 py-1.5 rounded-full border border-blue-500/30 shadow-lg">UPI Only</span>
                      </div>

                      <div className="flex flex-col gap-5 w-full justify-center h-full pt-2">
                        <div className="flex flex-wrap gap-3">
                          {[
                            { val: 20, label: '₹20 ☕' },
                            { val: 50, label: '₹50 🥤' },
                            { val: 100, label: '₹100 🥐' },
                            { val: 200, label: '₹200 🍱' },
                            { val: 500, label: '₹500 👑' }
                          ].map((opt) => (
                            <button
                              key={opt.val}
                              onClick={() => setCoffeeAmount(opt.val)}
                              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${coffeeAmount === opt.val
                                ? 'bg-blue-500 text-white border-blue-400 scale-110 shadow-lg shadow-blue-500/40'
                                : 'bg-black/40 text-white/60 border-white/10 hover:border-white/30 hover:text-white'
                                }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>

                        <div className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold px-6 py-4 rounded-2xl shadow-xl text-lg select-none cursor-default border border-white/10">
                          Scan with any UPI App to send ₹{coffeeAmount}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Tiny Scroll Arrows */}
            <div className="absolute inset-x-0 top-0 bottom-0 flex flex-col justify-between items-center pointer-events-none">
              <button onMouseDown={(e) => e.preventDefault()} onClick={() => scrollBy(settingsScrollRef, 'up')} className="pointer-events-auto flex items-center justify-center w-12 h-6 bg-blue-500/80 hover:bg-blue-500 border-x border-b border-blue-400/50 rounded-b-xl text-white backdrop-blur-md transition-all shadow-[0_0_10px_rgba(59,130,246,0.5)]"><ChevronUp size={16} strokeWidth={3} /></button>
              <button onMouseDown={(e) => e.preventDefault()} onClick={() => scrollBy(settingsScrollRef, 'down')} className="pointer-events-auto flex items-center justify-center w-12 h-6 bg-blue-500/80 hover:bg-blue-500 border-x border-t border-blue-400/50 rounded-t-xl text-white backdrop-blur-md transition-all shadow-[0_0_10px_rgba(59,130,246,0.5)]"><ChevronDown size={16} strokeWidth={3} /></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

}
