const fs = require('fs');
const file = 'components/SettingsModal.tsx';
let content = fs.readFileSync(file, 'utf8');

const focusTabStart = content.indexOf('              {settingsActiveTab === \'focus\' && (');
const dataTabStart = content.indexOf('              {settingsActiveTab === \'data\' && (');

if (focusTabStart === -1 || dataTabStart === -1) {
    console.error('Could not find focus or data tab');
    process.exit(1);
}

const oldFocusTab = content.substring(focusTabStart, dataTabStart);

const newFocusTab = `              {settingsActiveTab === 'focus' && (
                <div className="flex flex-col gap-6">
                  <div>
                    <h3 className="text-xl font-semibold flex items-center gap-2"><EyeOff className="text-red-400" /> Focus & Panic Mode</h3>
                    <p className="text-white/50 text-sm mt-1">Configure your screen visibility and customize shortcuts.</p>
                  </div>

                  {/* Screen Visibility & Shortcuts */}
                  <div className="flex flex-col p-4 rounded-2xl bg-black/20 border border-white/5 mt-2 gap-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-lg">Screen Visibility Shortcuts</h4>
                    </div>
                    
                    {/* Panic Mode */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/5 p-3 rounded-xl">
                      <div>
                        <p className="text-sm font-bold text-red-400">Panic Mode (Hide Everything)</p>
                        <p className="text-xs text-white/50">Instantly hide all widgets from your screen.</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <input
                          type="text"
                          value={panicShortcutKey.toUpperCase().replace(/\\+/g, ' + ')}
                          onKeyDown={(e) => handleShortcutCapture(e, setPanicShortcutKey)}
                          readOnly
                          placeholder="Press keys..."
                          className="w-36 h-8 px-2 bg-black/40 border border-white/10 rounded-lg text-center text-white outline-none focus:border-red-400 focus:bg-white/10 cursor-pointer font-bold uppercase text-xs"
                          title="Click to record new shortcut"
                        />
                        <button
                          onClick={() => togglePanicHide()}
                          className="ml-2 px-3 py-1.5 bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white rounded-lg transition-colors border border-red-500/30 text-xs font-bold uppercase tracking-wide"
                        >
                          Trigger
                        </button>
                      </div>
                    </div>

                    {/* Panic Wallpaper Switch */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                      <div className="flex items-center gap-3">
                        <ImageIcon size={18} className="text-red-400" />
                        <div>
                          <span className="text-sm font-medium">Switch to Photo Wallpaper on Panic</span>
                          <p className="text-xs text-white/50">If a video wallpaper is playing, switch to a photo instantly.</p>
                        </div>
                      </div>
                      <button onClick={() => setPanicWallpaperSwitch(!panicWallpaperSwitch)} className={\`relative inline-flex h-6 w-11 items-center rounded-full transition-colors \${panicWallpaperSwitch ? 'bg-red-500' : 'bg-white/20'}\`}>
                        <span className={\`inline-block h-4 w-4 transform rounded-full bg-white transition-transform \${panicWallpaperSwitch ? 'translate-x-6' : 'translate-x-1'}\`} />
                      </button>
                    </div>

                    {/* Focus Mode */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/5 p-3 rounded-xl">
                      <div>
                        <p className="text-sm font-bold text-blue-400">Focus Mode (Hide Selected)</p>
                        <p className="text-xs text-white/50">Hide only the widgets enabled in 'Widget Visibility'.</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <input
                          type="text"
                          value={focusShortcutKey.toUpperCase().replace(/\\+/g, ' + ')}
                          onKeyDown={(e) => handleShortcutCapture(e, setFocusShortcutKey)}
                          readOnly
                          placeholder="Press keys..."
                          className="w-36 h-8 px-2 bg-black/40 border border-white/10 rounded-lg text-center text-white outline-none focus:border-blue-400 focus:bg-white/10 cursor-pointer font-bold uppercase text-xs"
                          title="Click to record new shortcut"
                        />
                        <button
                          onClick={() => toggleHide()}
                          className="ml-2 px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500 text-blue-300 hover:text-white rounded-lg transition-colors border border-blue-500/30 text-xs font-bold uppercase tracking-wide"
                        >
                          Trigger
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Focus Mode Configuration */}
                  <div className="flex flex-col p-4 rounded-2xl bg-black/20 border border-white/5 mt-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                      <div>
                        <h4 className="font-medium text-lg text-red-400">Focus Mode Specific Selection</h4>
                        <p className="text-sm text-white/50 mt-1">Select which elements should be hidden when you activate Focus Mode.</p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => setHideAll(false)}
                          className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-xl transition-colors border border-white/10 font-medium text-sm"
                        >
                          Keep All Visible
                        </button>
                        <button
                          onClick={() => setHideAll(true)}
                          className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/40 text-red-300 rounded-xl transition-colors border border-red-500/30 font-medium text-sm"
                        >
                          Hide All
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {Object.entries({
                        quote: 'Daily Quote',
                        stats: 'Stats Modal',
                        plans: 'Roadmap & Plans',
                        countdowns: 'Target Countdowns',
                        tasks: 'Tasks',
                        notes: 'Quick Notes',
                        calendar: 'Calendar',
                        timetable: 'Timetable',
                        health: 'Health Rings',
                        timer: 'Session Timer',
                        dock: 'Bottom Dock',
                        clock: 'Big Clock',
                        deadlineAlerts: 'Deadline Alerts',
                        bgSwitcher: 'Background Switcher',
                        stopwatch: 'Stopwatch',
                        settingsBtn: 'Settings Button',
                        videoControls: 'Video Controls'
                      }).map(([key, label]) => (
                        <div key={key} className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                          <span className="text-sm text-white/80">{label}</span>
                          <button onClick={() => setHideConfig(key, !hideConfig[key])} className={\`relative inline-flex h-5 w-9 items-center rounded-full transition-colors \${hideConfig[key] ? 'bg-red-500' : 'bg-blue-500/50'}\`} title={hideConfig[key] ? 'Will be hidden in Focus Mode' : 'Will stay visible in Focus Mode'}>
                            <span className={\`inline-block h-3 w-3 transform rounded-full bg-white transition-transform \${hideConfig[key] ? 'translate-x-5' : 'translate-x-1'}\`} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

\n\n`;

content = content.replace(oldFocusTab, newFocusTab);
fs.writeFileSync(file, content, 'utf8');
console.log('Done rewriting Focus tab');
