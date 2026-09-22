import React, { useState } from 'react';
import {
  RefreshCw,
  Plus,
  Minus,
  CheckCircle2,
  Calendar,
  Target,
  Sparkles,
  Award,
  ChevronRight,
  TrendingDown,
  Edit2,
} from 'lucide-react';
import { triggerHaptic, soundEffects } from '../utils/audioHaptics';

export default function QazaDashboard({
  qazaCounts,
  onUpdateCount,
  onSetAllCounts,
  qazaPlan,
  onUpdatePlan,
}) {
  const [editingPrayer, setEditingPrayer] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [showPlannerModal, setShowPlannerModal] = useState(false);
  const [showBacklogModal, setShowBacklogModal] = useState(false);

  // Backlog state
  const [backlogInputs, setBacklogInputs] = useState({ ...qazaCounts });

  const prayers = [
    { key: 'fajr', name: 'Fajr', nameAr: 'فجر', nameBn: 'ফজর', color: 'from-blue-600 to-indigo-700' },
    { key: 'dhuhr', name: 'Dhuhr', nameAr: 'ظهر', nameBn: 'যোহর', color: 'from-amber-600 to-yellow-600' },
    { key: 'asr', name: 'Asr', nameAr: 'عصر', nameBn: 'আসর', color: 'from-orange-600 to-amber-700' },
    { key: 'maghrib', name: 'Maghrib', nameAr: 'مغرب', nameBn: 'মাগরিব', color: 'from-rose-600 to-pink-700' },
    { key: 'isha', name: 'Isha', nameAr: 'عشاء', nameBn: 'ইশা', color: 'from-indigo-700 to-purple-800' },
    { key: 'witr', name: 'Witr', nameAr: 'وتر', nameBn: 'বিতর (ওয়াজিব)', color: 'from-teal-600 to-emerald-700' },
  ];

  const totalOutstanding = Object.values(qazaCounts).reduce((acc, val) => acc + (val || 0), 0);

  const handlePayDown = (key, amount = 1) => {
    const current = qazaCounts[key] || 0;
    const next = Math.max(0, current - amount);
    triggerHaptic('medium');
    soundEffects.playTasbihClick();
    onUpdateCount(key, next);

    if (totalOutstanding - (current - next) === 0) {
      soundEffects.playMilestoneResonance();
      triggerHaptic('success');
    }
  };

  const handleAdd = (key, amount = 1) => {
    const current = qazaCounts[key] || 0;
    triggerHaptic('light');
    onUpdateCount(key, current + amount);
  };

  const saveManualEdit = (key) => {
    const parsed = parseInt(editValue, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      onUpdateCount(key, parsed);
    }
    setEditingPrayer(null);
  };

  // Plan Calculations
  const dailyTarget = qazaPlan.dailyTarget || 3;
  const daysNeeded = dailyTarget > 0 ? Math.ceil(totalOutstanding / dailyTarget) : 0;
  const projectedDate = new Date();
  projectedDate.setDate(projectedDate.getDate() + daysNeeded);

  const initialTotal = Math.max(totalOutstanding, qazaPlan.initialTotal || totalOutstanding);
  const clearedSoFar = Math.max(0, initialTotal - totalOutstanding);
  const progressPercent = initialTotal > 0 ? Math.min(100, Math.round((clearedSoFar / initialTotal) * 100)) : 100;

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      {/* Header & Philosophy Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#101D42] via-tadaruk-card to-[#12224A] border border-tadaruk-border p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs uppercase tracking-widest text-tadaruk-gold font-bold">
                Qaza Recovery • تدارك
              </span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700">
                Offline Database
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
              Outstanding Prayers
            </h2>
            <p className="text-xs text-tadaruk-muted max-w-md mt-1 leading-relaxed">
              "Whoever forgets a prayer or sleeps through it, let him pray it when he remembers." (Sahih Muslim)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setBacklogInputs({ ...qazaCounts });
                setShowBacklogModal(true);
              }}
              className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <Edit2 size={13} className="text-tadaruk-gold" />
              Adjust Backlog
            </button>
            <button
              onClick={() => setShowPlannerModal(true)}
              className="bg-tadaruk-gold hover:bg-tadaruk-goldLight text-slate-950 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-tadaruk-gold/20 transition-all"
            >
              <Target size={14} />
              Payoff Planner
            </button>
          </div>
        </div>

        {/* Total Outstanding Counter Badge */}
        <div className="mt-5 pt-4 border-t border-tadaruk-border/70 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-white font-mono">
              {totalOutstanding}
            </span>
            <span className="text-xs text-slate-400 font-medium">total qaza prayers to make up</span>
          </div>

          {totalOutstanding > 0 ? (
            <div className="flex items-center space-x-3 text-xs text-tadaruk-gold">
              <Calendar size={14} />
              <span>
                At <strong>{dailyTarget}/day</strong>, debt cleared by{' '}
                <strong className="text-white underline decoration-tadaruk-gold">
                  {projectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </strong>
              </span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-xs text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              <CheckCircle2 size={14} />
              <span>Alhamdulillah, zero pending qaza!</span>
            </div>
          )}
        </div>
      </div>

      {/* Celebratory "All Caught Up" State */}
      {totalOutstanding === 0 && (
        <div className="bg-gradient-to-b from-emerald-950/40 via-tadaruk-card to-tadaruk-card border border-emerald-500/40 rounded-3xl p-8 text-center space-y-3 shadow-xl shadow-emerald-500/10 animate-in zoom-in-95 duration-300">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/30">
            <Award size={36} className="stroke-[2.5]" />
          </div>
          <h3 className="text-xl font-extrabold text-white">All Caught Up! ما شاء الله</h3>
          <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
            Your prayer ledger is completely clear. Keep up your timely devotion, and remember Allah in all moments.
          </p>
          <span className="inline-block text-xs font-arabic text-tadaruk-gold bg-slate-900/80 px-4 py-1.5 rounded-full border border-slate-700">
            الحمد لله حمداً كثيراً طيباً مباركاً فيه
          </span>
        </div>
      )}

      {/* Payoff Progress Bar */}
      {totalOutstanding > 0 && initialTotal > 0 && (
        <div className="bg-tadaruk-card border border-tadaruk-border rounded-2xl p-4">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-slate-400 font-medium">Recovery Goal Progress</span>
            <span className="text-tadaruk-gold font-bold">{progressPercent}% recovered</span>
          </div>
          <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-tadaruk-gold to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.max(5, progressPercent)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-tadaruk-muted mt-2">
            <span>{clearedSoFar} made up</span>
            <span>{daysNeeded} days remaining</span>
          </div>
        </div>
      )}

      {/* Prayer Balance Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {prayers.map((prayer) => {
          const count = qazaCounts[prayer.key] || 0;
          const isZero = count === 0;

          return (
            <div
              key={prayer.key}
              className={`rounded-2xl p-4 border transition-all duration-200 relative overflow-hidden ${
                isZero
                  ? 'bg-tadaruk-card/60 border-tadaruk-border/60 opacity-80'
                  : 'bg-tadaruk-card border-tadaruk-border hover:border-slate-600 shadow-md'
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-base text-white">{prayer.name}</h3>
                    <span className="font-arabic text-sm text-tadaruk-gold">{prayer.nameAr}</span>
                  </div>
                  <span className="text-[11px] text-tadaruk-muted font-bangla">{prayer.nameBn}</span>
                </div>

                <button
                  onClick={() => {
                    setEditingPrayer(prayer.key);
                    setEditValue(count.toString());
                  }}
                  title="Direct edit count"
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
                >
                  <Edit2 size={13} />
                </button>
              </div>

              {/* Outstanding Count Display */}
              <div className="my-4 text-center py-2 bg-slate-950/60 rounded-xl border border-slate-900">
                {editingPrayer === prayer.key ? (
                  <div className="flex items-center justify-center gap-2 px-2">
                    <input
                      type="number"
                      min="0"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-24 bg-slate-900 border border-tadaruk-gold text-white font-mono text-xl text-center rounded-lg py-1 focus:outline-none"
                      autoFocus
                    />
                    <button
                      onClick={() => saveManualEdit(prayer.key)}
                      className="bg-tadaruk-gold text-slate-950 font-bold px-2.5 py-1 rounded-lg text-xs"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <div>
                    <span
                      className={`text-3xl font-black font-mono tracking-tight ${
                        isZero ? 'text-emerald-400' : 'text-white'
                      }`}
                    >
                      {count}
                    </span>
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mt-0.5">
                      {isZero ? 'Caught Up' : 'Pending'}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons: -1, -5, +1 */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePayDown(prayer.key, 1)}
                  disabled={isZero}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                    isZero
                      ? 'bg-slate-800/40 text-slate-600 border border-slate-800 cursor-not-allowed'
                      : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-600/20 active:scale-95'
                  }`}
                >
                  <Minus size={14} />
                  <span>Pay 1</span>
                </button>

                <button
                  onClick={() => handlePayDown(prayer.key, 5)}
                  disabled={count < 5}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    count < 5
                      ? 'bg-slate-800/40 text-slate-600 border border-slate-800 cursor-not-allowed'
                      : 'bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 active:scale-95'
                  }`}
                  title="Pay down 5 qaza prayers"
                >
                  -5
                </button>

                <button
                  onClick={() => handleAdd(prayer.key, 1)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 active:scale-95 transition-all"
                  title="Add 1 missed prayer"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Payoff Planner Modal */}
      {showPlannerModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-tadaruk-card border border-tadaruk-border rounded-3xl p-6 max-w-md w-full space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Target className="text-tadaruk-gold" size={18} />
                Qaza Payoff Planner
              </h3>
              <button
                onClick={() => setShowPlannerModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-tadaruk-muted leading-relaxed">
              Set a daily pace that fits your routine. Consistent, steady recovery brings peace of mind without overwhelm.
            </p>

            <div className="space-y-3 pt-2">
              <label className="block text-xs font-semibold text-slate-300">
                Daily Qaza Target: <span className="text-tadaruk-gold text-sm font-bold">{qazaPlan.dailyTarget} prayers/day</span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 5].map((val) => (
                  <button
                    key={val}
                    onClick={() => onUpdatePlan({ ...qazaPlan, dailyTarget: val })}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      qazaPlan.dailyTarget === val
                        ? 'bg-tadaruk-gold text-slate-950 border-tadaruk-gold'
                        : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {val} / day
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Total backlog:</span>
                <span className="font-mono font-bold text-white">{totalOutstanding} prayers</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Estimated days to clear:</span>
                <span className="font-mono font-bold text-emerald-400">{daysNeeded} days</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Projected completion:</span>
                <span className="font-bold text-tadaruk-gold">
                  {projectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowPlannerModal(false)}
              className="w-full py-3 bg-tadaruk-gold hover:bg-tadaruk-goldLight text-slate-950 font-bold rounded-xl text-sm shadow-md transition-colors"
            >
              Save Payoff Schedule
            </button>
          </div>
        </div>
      )}

      {/* Adjust Backlog Modal */}
      {showBacklogModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-tadaruk-card border border-tadaruk-border rounded-3xl p-6 max-w-md w-full space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Initial Backlog Entry</h3>
              <button
                onClick={() => setShowBacklogModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-tadaruk-muted">
              Enter your estimated missed prayers. You can freely adjust this anytime.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              {prayers.map((p) => (
                <div key={p.key} className="space-y-1">
                  <label className="text-xs text-slate-300 font-semibold">{p.name}</label>
                  <input
                    type="number"
                    min="0"
                    value={backlogInputs[p.key] || 0}
                    onChange={(e) =>
                      setBacklogInputs({
                        ...backlogInputs,
                        [p.key]: Math.max(0, parseInt(e.target.value, 10) || 0),
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-700 text-white font-mono rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-tadaruk-gold"
                  />
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                onSetAllCounts(backlogInputs);
                setShowBacklogModal(false);
              }}
              className="w-full py-3 bg-tadaruk-gold hover:bg-tadaruk-goldLight text-slate-950 font-bold rounded-xl text-sm shadow-md transition-colors"
            >
              Update Ledger
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
