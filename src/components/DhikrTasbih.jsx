import React, { useState } from 'react';
import {
  Sparkles,
  Sun,
  Moon,
  RotateCcw,
  Plus,
  Trash2,
  Heart,
  Check,
  Award,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import { MORNING_EVENING_ADHKAR } from '../data/islamicContent';
import { triggerHaptic, soundEffects } from '../utils/audioHaptics';

export default function DhikrTasbih({
  adhkarProgress,
  onUpdateAdhkarProgress,
  customDhikrs,
  onAddCustomDhikr,
  onDeleteCustomDhikr,
  sadaqahLogs,
  onAddSadaqahLog,
}) {
  const [activeSubTab, setActiveSubTab] = useState('adhkar'); // 'adhkar' | 'tasbih' | 'sadaqah'
  const [adhkarTime, setAdhkarTime] = useState('morning'); // 'morning' | 'evening'

  // Free-form Tasbih State
  const [tasbihCount, setTasbihCount] = useState(0);
  const [tasbihTarget, setTasbihTarget] = useState(33); // 33, 99, 100, or custom
  const [tasbihPhrase, setTasbihPhrase] = useState('SubhanAllah');

  // Custom Dhikr Modal
  const [showAddCustomModal, setShowAddCustomModal] = useState(false);
  const [newDhikrTitle, setNewDhikrTitle] = useState('');
  const [newDhikrArabic, setNewDhikrArabic] = useState('');
  const [newDhikrTarget, setNewDhikrTarget] = useState(33);

  // Sadaqah Log Modal
  const [newSadaqahNote, setNewSadaqahNote] = useState('');
  const [newSadaqahCategory, setNewSadaqahCategory] = useState('Charity');

  // Filter Adhkar by time
  const currentAdhkarList = MORNING_EVENING_ADHKAR.filter(
    (item) => item.time === 'both' || item.time === adhkarTime
  );

  // Handle Tasbih increment
  const handleTasbihTap = () => {
    const next = tasbihCount + 1;
    triggerHaptic('light');
    soundEffects.playTasbihClick();

    if (next % tasbihTarget === 0) {
      triggerHaptic('success');
      soundEffects.playMilestoneResonance();
    }
    setTasbihCount(next);
  };

  const handleTasbihReset = () => {
    triggerHaptic('medium');
    setTasbihCount(0);
  };

  const handleIncrementAdhkar = (id, target) => {
    const current = adhkarProgress[id] || 0;
    if (current >= target) return;
    const next = current + 1;
    triggerHaptic('light');
    soundEffects.playTasbihClick();

    if (next === target) {
      triggerHaptic('success');
      soundEffects.playMilestoneResonance();
    }
    onUpdateAdhkarProgress(id, next);
  };

  const handleResetAdhkarItem = (id) => {
    triggerHaptic('light');
    onUpdateAdhkarProgress(id, 0);
  };

  // SVG Progress for free-form Tasbih
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const progressRatio = Math.min(1, (tasbihCount % tasbihTarget) / tasbihTarget);
  const strokeDashoffset = circumference - progressRatio * circumference;

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      {/* Top Segmented Controls */}
      <div className="flex items-center justify-center p-1 bg-slate-900/80 rounded-2xl border border-tadaruk-border/80 max-w-sm mx-auto">
        <button
          onClick={() => setActiveSubTab('adhkar')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            activeSubTab === 'adhkar'
              ? 'bg-tadaruk-gold text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Daily Adhkar
        </button>
        <button
          onClick={() => setActiveSubTab('tasbih')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            activeSubTab === 'tasbih'
              ? 'bg-tadaruk-gold text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Freeform Tasbih
        </button>
        <button
          onClick={() => setActiveSubTab('sadaqah')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            activeSubTab === 'sadaqah'
              ? 'bg-tadaruk-gold text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Good Deeds
        </button>
      </div>

      {/* 1. DAILY ADHKAR VIEW */}
      {activeSubTab === 'adhkar' && (
        <div className="space-y-4">
          {/* Time Switcher (Morning / Evening) */}
          <div className="flex items-center justify-between bg-tadaruk-card border border-tadaruk-border p-3 rounded-2xl">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setAdhkarTime('morning')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  adhkarTime === 'morning'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sun size={14} />
                <span>Morning Adhkar (صباحاً)</span>
              </button>
              <button
                onClick={() => setAdhkarTime('evening')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  adhkarTime === 'evening'
                    ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Moon size={14} />
                <span>Evening Adhkar (مساءً)</span>
              </button>
            </div>

            <button
              onClick={() => setShowAddCustomModal(true)}
              className="text-xs font-semibold text-tadaruk-gold flex items-center gap-1 hover:underline"
            >
              <Plus size={14} />
              Add Custom
            </button>
          </div>

          {/* Adhkar Items */}
          <div className="space-y-3">
            {currentAdhkarList.map((item) => {
              const current = adhkarProgress[item.id] || 0;
              const isDone = current >= item.repeatTarget;

              return (
                <div
                  key={item.id}
                  className={`bg-tadaruk-card border rounded-2xl p-4 transition-all duration-200 ${
                    isDone
                      ? 'border-emerald-500/40 bg-emerald-950/10'
                      : 'border-tadaruk-border hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-bold text-sm text-white">{item.title}</h4>
                        <span className="text-[11px] text-tadaruk-gold font-bangla">
                          ({item.titleBn})
                        </span>
                      </div>
                      <p className="text-[11px] text-tadaruk-muted mt-0.5">{item.virtue}</p>
                    </div>

                    {/* Counter Button */}
                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => handleIncrementAdhkar(item.id, item.repeatTarget)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                          isDone
                            ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-sm'
                            : 'bg-tadaruk-gold hover:bg-tadaruk-goldLight text-slate-950 font-bold active:scale-95'
                        }`}
                      >
                        {isDone ? (
                          <>
                            <Check size={14} /> Done
                          </>
                        ) : (
                          <>
                            <span>Tap</span>
                            <span className="bg-slate-950/20 px-1.5 py-0.5 rounded text-[11px]">
                              {current}/{item.repeatTarget}
                            </span>
                          </>
                        )}
                      </button>

                      {current > 0 && (
                        <button
                          onClick={() => handleResetAdhkarItem(item.id)}
                          title="Reset item count"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300"
                        >
                          <RotateCcw size={12} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Arabic Text */}
                  <p className="font-arabic text-base sm:text-lg text-right text-tadaruk-goldLight leading-loose mt-3 border-t border-tadaruk-border/50 pt-2 font-medium">
                    {item.arabic}
                  </p>

                  {/* Meaning */}
                  <p className="text-xs text-slate-300 italic mt-2">
                    "{item.meaning}"
                  </p>
                </div>
              );
            })}

            {/* Custom User Adhkar */}
            {customDhikrs.map((item) => {
              const current = adhkarProgress[item.id] || 0;
              const isDone = current >= item.target;

              return (
                <div
                  key={item.id}
                  className="bg-tadaruk-card border border-tadaruk-border rounded-2xl p-4 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-white">{item.title}</h4>
                      {item.arabic && (
                        <span className="font-arabic text-xs text-tadaruk-gold">
                          {item.arabic}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleIncrementAdhkar(item.id, item.target)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                          isDone ? 'bg-emerald-500 text-slate-950' : 'bg-tadaruk-gold text-slate-950'
                        }`}
                      >
                        {current} / {item.target}
                      </button>
                      <button
                        onClick={() => onDeleteCustomDhikr(item.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. FREE-FORM TASBIH COUNTER */}
      {activeSubTab === 'tasbih' && (
        <div className="bg-tadaruk-card border border-tadaruk-border rounded-3xl p-6 text-center space-y-6 max-w-md mx-auto">
          {/* Preset Phrases */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {[
              { label: 'SubhanAllah', ar: 'سُبْحَانَ اللَّهِ' },
              { label: 'Alhamdulillah', ar: 'الْحَمْدُ لِلَّهِ' },
              { label: 'Allahu Akbar', ar: 'اللَّهُ أَكْبَرُ' },
              { label: 'Astaghfirullah', ar: 'أَسْتَغْفِرُ اللَّهَ' },
            ].map((p) => (
              <button
                key={p.label}
                onClick={() => setTasbihPhrase(p.label)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                  tasbihPhrase === p.label
                    ? 'bg-tadaruk-gold text-slate-950 border-tadaruk-gold font-bold shadow-sm'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Large Tap Ring */}
          <div className="relative flex items-center justify-center py-4">
            <button
              onClick={handleTasbihTap}
              className="relative w-52 h-52 rounded-full flex flex-col items-center justify-center bg-gradient-to-b from-[#111C3D] to-[#0A1124] border-4 border-tadaruk-border shadow-2xl active:scale-95 transition-transform duration-100 group cursor-pointer focus:outline-none"
            >
              {/* Outer Progress SVG */}
              <svg className="absolute inset-0 w-full h-full transform -rotate-90 pointer-events-none">
                <circle
                  cx="104"
                  cy="104"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-slate-800"
                />
                <circle
                  cx="104"
                  cy="104"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="text-tadaruk-gold transition-all duration-150"
                />
              </svg>

              <span className="text-4xl sm:text-5xl font-black font-mono text-white tracking-tight">
                {tasbihCount}
              </span>
              <span className="text-xs uppercase tracking-widest text-tadaruk-gold font-bold mt-1">
                Target: {tasbihTarget}
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5">
                Cycle #{Math.floor(tasbihCount / tasbihTarget) + 1}
              </span>
            </button>
          </div>

          {/* Target Selectors & Reset */}
          <div className="flex items-center justify-between pt-2 border-t border-tadaruk-border/70">
            <div className="flex items-center space-x-1.5">
              {[33, 99, 100].map((t) => (
                <button
                  key={t}
                  onClick={() => setTasbihTarget(t)}
                  className={`px-2.5 py-1 text-xs rounded-lg font-bold border transition-colors ${
                    tasbihTarget === t
                      ? 'bg-slate-800 text-tadaruk-gold border-tadaruk-gold'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <button
              onClick={handleTasbihReset}
              className="flex items-center space-x-1 text-xs text-rose-400 hover:text-rose-300 bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-xl font-semibold transition-colors"
            >
              <RotateCcw size={13} />
              <span>Reset Counter</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. SADAQAH / GOOD DEEDS MICRO-JOURNAL */}
      {activeSubTab === 'sadaqah' && (
        <div className="space-y-4">
          <div className="bg-tadaruk-card border border-tadaruk-border rounded-3xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Heart size={18} className="text-rose-400" />
                  Sadaqah & Acts of Kindness
                </h3>
                <p className="text-xs text-tadaruk-muted">
                  A private, quiet log to encourage consistency in daily good deeds
                </p>
              </div>
            </div>

            {/* Quick Add Form */}
            <div className="space-y-2 pt-2">
              <input
                type="text"
                value={newSadaqahNote}
                onChange={(e) => setNewSadaqahNote(e.target.value)}
                placeholder="e.g. Fed a hungry animal, smiled at someone, helped elderly neighbor..."
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-tadaruk-gold"
              />
              <div className="flex items-center justify-between">
                <select
                  value={newSadaqahCategory}
                  onChange={(e) => setNewSadaqahCategory(e.target.value)}
                  className="bg-slate-900 text-slate-300 border border-slate-700 text-xs rounded-xl px-2.5 py-1.5"
                >
                  <option value="Charity">Monetary Charity</option>
                  <option value="Kindness">Act of Kindness</option>
                  <option value="Smile">Sunnah Smile / Good Word</option>
                  <option value="Family">Family Support</option>
                  <option value="Knowledge">Shared Beneficial Knowledge</option>
                </select>

                <button
                  onClick={() => {
                    if (newSadaqahNote.trim()) {
                      onAddSadaqahLog({
                        id: Date.now().toString(),
                        date: new Date().toISOString(),
                        note: newSadaqahNote.trim(),
                        category: newSadaqahCategory,
                      });
                      setNewSadaqahNote('');
                    }
                  }}
                  className="bg-tadaruk-gold hover:bg-tadaruk-goldLight text-slate-950 font-bold px-4 py-1.5 rounded-xl text-xs"
                >
                  Record Deed
                </button>
              </div>
            </div>
          </div>

          {/* Past Deeds Log */}
          <div className="space-y-2">
            {sadaqahLogs.length === 0 ? (
              <div className="text-center py-8 bg-tadaruk-card/50 border border-tadaruk-border/50 rounded-2xl text-xs text-tadaruk-muted">
                No entries yet. Small acts of kindness are beloved to Allah!
              </div>
            ) : (
              sadaqahLogs.map((log) => (
                <div
                  key={log.id}
                  className="bg-tadaruk-card border border-tadaruk-border rounded-xl p-3 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center space-x-2.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <div>
                      <p className="font-semibold text-slate-100">{log.note}</p>
                      <span className="text-[10px] text-tadaruk-muted">
                        {new Date(log.date).toLocaleDateString()} • {log.category}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] text-tadaruk-gold font-arabic">جزاك الله خيراً</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Add Custom Dhikr Modal */}
      {showAddCustomModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-tadaruk-card border border-tadaruk-border rounded-3xl p-6 max-w-md w-full space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Add Custom Dhikr</h3>
              <button
                onClick={() => setShowAddCustomModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">
                  Title / Transliteration
                </label>
                <input
                  type="text"
                  value={newDhikrTitle}
                  onChange={(e) => setNewDhikrTitle(e.target.value)}
                  placeholder="e.g. La hawla wa la quwwata illa billah"
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">
                  Arabic Text (Optional)
                </label>
                <input
                  type="text"
                  value={newDhikrArabic}
                  onChange={(e) => setNewDhikrArabic(e.target.value)}
                  placeholder="لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ"
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs font-arabic text-right"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">
                  Repeat Target
                </label>
                <input
                  type="number"
                  min="1"
                  value={newDhikrTarget}
                  onChange={(e) => setNewDhikrTarget(parseInt(e.target.value, 10) || 1)}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs"
                />
              </div>
            </div>

            <button
              onClick={() => {
                if (newDhikrTitle.trim()) {
                  onAddCustomDhikr({
                    id: 'custom_' + Date.now(),
                    title: newDhikrTitle.trim(),
                    arabic: newDhikrArabic.trim(),
                    target: newDhikrTarget,
                  });
                  setNewDhikrTitle('');
                  setNewDhikrArabic('');
                  setShowAddCustomModal(false);
                }
              }}
              className="w-full py-2.5 bg-tadaruk-gold text-slate-950 font-bold rounded-xl text-xs"
            >
              Save Custom Dhikr
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
