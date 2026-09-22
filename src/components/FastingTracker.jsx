import React, { useState } from 'react';
import { Calendar, Plus, Minus, Check, Sparkles, Flame, Info, CheckCircle2 } from 'lucide-react';
import { getHijriDate } from '../utils/prayerEngine';
import { triggerHaptic, soundEffects } from '../utils/audioHaptics';

export default function FastingTracker({
  fastingLogs,
  onToggleFast,
  qazaFasts,
  onUpdateQazaFasts,
  hijriDate,
}) {
  const todayStr = new Date().toISOString().split('T')[0];
  const todayLog = fastingLogs[todayStr];

  // Qaza fasts actions
  const handlePayQazaFast = (amount = 1) => {
    triggerHaptic('medium');
    soundEffects.playTasbihClick();
    onUpdateQazaFasts(Math.max(0, qazaFasts - amount));
  };

  const handleAddQazaFast = (amount = 1) => {
    triggerHaptic('light');
    onUpdateQazaFasts(qazaFasts + amount);
  };

  // Compute upcoming Sunnah Fasting Days (Next 30 days)
  const upcomingSunnahFasts = [];
  for (let i = 0; i < 30; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dayOfWeek = d.getDay(); // 0 = Sunday, 1 = Monday, 4 = Thursday
    const h = getHijriDate(d);

    const isMondayThursday = dayOfWeek === 1 || dayOfWeek === 4;
    const isAyyamAlBid = h.day === 13 || h.day === 14 || h.day === 15;
    const isAshura = h.month === 1 && (h.day === 9 || h.day === 10);
    const isArafah = h.month === 12 && h.day === 9;
    const isShawwal6 = h.month === 10 && h.day >= 2 && h.day <= 7;

    if (isMondayThursday || isAyyamAlBid || isAshura || isArafah || isShawwal6) {
      let typeLabel = '';
      let virtue = '';

      if (isAshura) {
        typeLabel = 'Ashura Fast';
        virtue = 'Expiates the minor sins of the past year.';
      } else if (isArafah) {
        typeLabel = 'Day of Arafah';
        virtue = 'Expiates sins of the previous year and the coming year.';
      } else if (isShawwal6) {
        typeLabel = 'Six Days of Shawwal';
        virtue = 'Equivalent to fasting an entire lifetime.';
      } else if (isAyyamAlBid) {
        typeLabel = 'Ayyam al-Bid (White Days)';
        virtue = 'Fasting 3 days every month is like continuous fasting.';
      } else if (isMondayThursday) {
        typeLabel = dayOfWeek === 1 ? 'Sunnah Monday' : 'Sunnah Thursday';
        virtue = 'Deeds are presented to Allah on Mondays and Thursdays.';
      }

      upcomingSunnahFasts.push({
        date: d,
        dateStr: d.toISOString().split('T')[0],
        formattedDate: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        hijriFormatted: `${h.day} ${h.monthName}`,
        typeLabel,
        virtue,
        daysAway: i,
      });
    }
  }

  // Heatmap: Past 16 weeks (112 days)
  const heatmapDays = [];
  for (let i = 111; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dStr = d.toISOString().split('T')[0];
    const log = fastingLogs[dStr];
    heatmapDays.push({
      dateStr: dStr,
      log,
      date: d,
    });
  }

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0C2340] via-tadaruk-card to-[#0F2F53] border border-tadaruk-border p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs uppercase tracking-widest text-tadaruk-gold font-bold">
                Fasting Sanctuary • الصيام
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
              Fasting Tracker
            </h2>
            <p className="text-xs text-tadaruk-muted max-w-md mt-1">
              "Fasting is a shield, and a fortified fortress against the Fire." (Musnad Ahmad)
            </p>
          </div>

          {/* Today Fasting Status Button */}
          <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800 flex items-center gap-3">
            <div>
              <span className="text-[11px] text-slate-400 block">Today's Fast</span>
              <span className="text-xs font-bold text-white capitalize">
                {todayLog ? `${todayLog.type} Fast` : 'Not Logged'}
              </span>
            </div>
            <div className="flex gap-1.5">
              {['nafl', 'qaza', 'fard'].map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    triggerHaptic('light');
                    onToggleFast(todayStr, todayLog?.type === type ? null : type);
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold capitalize border transition-all ${
                    todayLog?.type === type
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold shadow-sm'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Qaza Fasts Ledger Bar */}
        <div className="mt-5 pt-4 border-t border-tadaruk-border/70 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <span className="text-xs text-slate-400 font-medium">Qaza Fasts Balance:</span>
            <span className="text-2xl font-black font-mono text-white">{qazaFasts}</span>
            <span className="text-xs text-tadaruk-muted">days remaining to make up</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePayQazaFast(1)}
              disabled={qazaFasts <= 0}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                qazaFasts <= 0
                  ? 'bg-slate-800/40 text-slate-600 border border-slate-800 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
              }`}
            >
              <Minus size={13} />
              Pay 1 Fast
            </button>
            <button
              onClick={() => handleAddQazaFast(1)}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
              title="Add 1 missed fast"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Visual Fasting Heatmap (Past 16 Weeks) */}
      <div className="bg-tadaruk-card border border-tadaruk-border rounded-3xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Flame size={16} className="text-amber-400" />
              Annual Fasting Heatmap
            </h3>
            <p className="text-xs text-tadaruk-muted">Past 16 weeks of tracked devotion</p>
          </div>
          <div className="flex items-center space-x-2 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span> Fard
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-500"></span> Nafl
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-blue-500"></span> Qaza
            </span>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="grid grid-flow-col grid-rows-7 gap-1.5 overflow-x-auto py-2">
          {heatmapDays.map((item, idx) => {
            let bgClass = 'bg-slate-900 border border-slate-800/60';
            if (item.log) {
              if (item.log.type === 'fard') bgClass = 'bg-emerald-500 shadow-sm shadow-emerald-500/20';
              else if (item.log.type === 'nafl') bgClass = 'bg-amber-500 shadow-sm shadow-amber-500/20';
              else if (item.log.type === 'qaza') bgClass = 'bg-blue-500 shadow-sm shadow-blue-500/20';
            }

            return (
              <div
                key={idx}
                title={`${item.dateStr}: ${item.log?.type || 'No fast'}`}
                className={`w-3.5 h-3.5 rounded-sm transition-colors ${bgClass}`}
              />
            );
          })}
        </div>
      </div>

      {/* Upcoming Nafl Fasting Days Calendar */}
      <div className="bg-tadaruk-card border border-tadaruk-border rounded-3xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Calendar size={18} className="text-tadaruk-gold" />
              Upcoming Sunnah Fasting Opportunities
            </h3>
            <p className="text-xs text-tadaruk-muted">
              Computed from the Hijri calendar so you can plan ahead
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {upcomingSunnahFasts.slice(0, 8).map((fast, i) => {
            const isToday = fast.daysAway === 0;
            return (
              <div
                key={i}
                className={`p-3.5 rounded-2xl border transition-all ${
                  isToday
                    ? 'bg-tadaruk-gold/10 border-tadaruk-gold/60 shadow-md'
                    : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white">
                    {fast.typeLabel}
                  </span>
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      isToday
                        ? 'bg-tadaruk-gold text-slate-950'
                        : 'bg-slate-800 text-tadaruk-gold'
                    }`}
                  >
                    {isToday ? 'Today!' : fast.daysAway === 1 ? 'Tomorrow' : `In ${fast.daysAway} days`}
                  </span>
                </div>

                <p className="text-xs text-slate-300 font-medium mt-1">
                  {fast.formattedDate} • <span className="text-tadaruk-gold font-arabic">{fast.hijriFormatted}</span>
                </p>

                <p className="text-[11px] text-tadaruk-muted mt-1 leading-snug italic">
                  {fast.virtue}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
