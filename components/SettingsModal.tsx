'use client';

import { useState, useEffect, useRef } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { X, Upload, Trash2, Image as ImageIcon, Settings as SettingsIcon, MonitorPlay, Clock, Users, Plus } from 'lucide-react';

export default function SettingsModal() {
  const { isSettingsOpen, toggleSettings, is24HourClock, toggle24HourClock, currentBgSrc } = useDashboardStore();
  const [activeTab, setActiveTab] = useState<'wallpapers' | 'preferences' | 'profiles'>('wallpapers');

  const [wallpapers, setWallpapers] = useState<{ type: string, src: string, filename: string }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  if (!isSettingsOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6 pointer-events-auto">
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
              Profiles
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-white/20">

            {activeTab === 'profiles' && (
              <div className="flex flex-col gap-6">
                <div>
                  <h3 className="text-xl font-semibold">User Profiles</h3>
                  <p className="text-white/50 text-sm mt-1">Switch between different users or contexts. Each profile has a completely separate dashboard state and health history.</p>
                </div>

                <div className="flex flex-col gap-4">
                  <h4 className="font-medium text-lg border-b border-white/10 pb-2">Existing Profiles</h4>
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
                                Switch Profile
                              </button>
                            )}
                            {p.id !== 1 && (
                              <button
                                onClick={() => handleDeleteProfile(p.id, p.name)}
                                className="p-2 bg-red-500/20 hover:bg-red-500/80 text-red-300 hover:text-white rounded-xl transition-colors border border-red-500/30 hover:border-red-500"
                                title="Delete Profile"
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
                  <h4 className="font-medium text-lg border-b border-white/10 pb-2">Create New Profile</h4>
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

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {wallpapers.map((bg) => {
                    const isActive = currentBgSrc === bg.src;
                    return (
                      <div key={bg.filename} className={`relative group aspect-video rounded-xl overflow-hidden bg-black/40 border-2 transition-all ${isActive ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'border-white/10 hover:border-white/30'}`}>
                        {bg.type === 'image' ? (
                          <img src={bg.src} alt={bg.filename} className="w-full h-full object-cover" />
                        ) : (
                          <video src={bg.src} className="w-full h-full object-cover" />
                        )}

                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium truncate text-white/90 drop-shadow-md pr-2">{bg.filename}</span>
                            <button
                              onClick={() => handleDelete(bg.filename)}
                              className="p-1.5 bg-red-500/80 hover:bg-red-500 text-white rounded-lg transition-colors shrink-0 backdrop-blur-md"
                              title="Delete wallpaper"
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
                  {wallpapers.length === 0 && (
                    <div className="col-span-full py-12 text-center text-white/40 border-2 border-dashed border-white/10 rounded-2xl">
                      No wallpapers found. Upload some to get started!
                    </div>
                  )}
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

                  {/* More settings can be added here easily later */}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
