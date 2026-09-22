import React, { useState } from 'react';
import {
  TrendingUp,
  BarChart3,
  Calendar,
  Award,
  Share2,
  FileText,
  Lightbulb,
  HeartHandshake,
  CheckCircle2,
} from 'lucide-react';
import { triggerHaptic } from '../utils/audioHaptics';

export default function InsightsView({ prayerLogs, qazaCounts }) {
  const [timeRange, setTimeRange] = useState('7d'); // '7d' | '30d'

  // Generate last 7 days of logs
  const last7Days = [];
  const prayerKeys = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
  const prayerMissCounts = { fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 };

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dStr = d.toISOString().split('T')[0];
    const log = prayerLogs[dStr] || {};

    let completed = 0;
    prayerKeys.forEach((k) => {
      if (log[k]) {
        completed++;
      } else {
        prayerMissCounts[k]++;
      }
    });

    last7Days.push({
      dateStr: dStr,
      dayName: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
      completed,
      ratio: completed / 5,
    });
  }

  // Identify most missed prayer
  let mostMissedPrayer = 'fajr';
  let maxMisses = -1;
  Object.entries(prayerMissCounts).forEach(([k, count]) => {
    if (count > maxMisses) {
      maxMisses = count;
      mostMissedPrayer = k;
    }
  });

  const tipsMap = {
    fajr: {
      name: 'Fajr (Dawn)',
      tip: 'Place your alarm away from your bed and make intention (niyyah) before sleeping with Wudu.',
      hadith: 'The two Sunnah rakats of Fajr are better than the entire world and what it contains. (Muslim)',
    },
    dhuhr: {
      name: 'Dhuhr (Midday)',
      tip: 'Set a calendar reminder before your midday meetings or take a 10-minute spiritual pause.',
      hadith: 'At midday the gates of heaven are opened, and I love that good deeds ascend for me then.',
    },
    asr: {
      name: 'Asr (Afternoon)',
      tip: 'The afternoon transition is often rushed. Guard the middle prayer before closing work tasks.',
      hadith: 'Whoever prays the two cool prayers (Fajr and Asr) will enter Paradise. (Bukhari)',
    },
    maghrib: {
      name: 'Maghrib (Sunset)',
      tip: 'Sunset window is shorter than others. Aim to pause immediately upon hearing the call.',
      hadith: 'My nation will remain upon goodness so long as they do not delay Maghrib. (Abu Dawud)',
    },
    isha: {
      name: 'Isha (Night)',
      tip: 'Pray Isha directly after arrival home to conclude the night in tranquility before fatigue sets in.',
      hadith: 'Whoever prays Isha in congregation, it is as if he spent half the night in prayer. (Muslim)',
    },
  };

  const advice = tipsMap[mostMissedPrayer] || tipsMap.fajr;

  // Streak calculation with 1-day mercy buffer
  let currentStreak = 0;
  let hasUsedMercy = false;
  for (let i = 0; i < 30; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dStr = d.toISOString().split('T')[0];
    const log = prayerLogs[dStr] || {};
    const count = prayerKeys.filter((k) => !!log[k]).length;

    if (count >= 4) {
      currentStreak++;
    } else if (!hasUsedMercy && i > 0) {
      // Grace/mercy day granted
      hasUsedMercy = true;
    } else {
      break;
    }
  }

  // Share text summary
  const handleShareSummary = () => {
    triggerHaptic('light');
    const text = `🌟 Tadaruk Worship Reflection 🌟\n- Current Consistency Streak: ${currentStreak} days (with mercy grace)\n- Weekly Prayers Prayed: ${last7Days.reduce(
      (a, b) => a + b.completed,
      0
    )}/35\n- Qaza Remaining: ${Object.values(qazaCounts).reduce(
      (a, b) => a + (b || 0),
      0
    )}\nMay Allah accept our humble efforts! #Tadaruk`;

    if (navigator.share) {
      navigator.share({ title: 'My Tadaruk Reflection', text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      alert('Summary copied to clipboard!');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#172147] via-tadaruk-card to-[#121B3A] border border-tadaruk-border p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs uppercase tracking-widest text-tadaruk-gold font-bold">
                Spiritual Analytics • البصيرة
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
              Worship Insights
            </h2>
            <p className="text-xs text-tadaruk-muted max-w-md mt-1">
              "The deeds most loved by Allah are those done regularly, even if small." (Bukhari & Muslim)
            </p>
          </div>

          <button
            onClick={handleShareSummary}
            className="bg-tadaruk-gold hover:bg-tadaruk-goldLight text-slate-950 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-tadaruk-gold/20 transition-all"
          >
            <Share2 size={14} />
            Share Summary
          </button>
        </div>

        {/* Streak & Consistency Bar */}
        <div className="mt-5 pt-4 border-t border-tadaruk-border/70 grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <span className="text-xs text-slate-400 block">Active Consistency</span>
            <div className="flex items-baseline space-x-1.5 mt-0.5">
              <span className="text-3xl font-extrabold text-white font-mono">{currentStreak}</span>
              <span className="text-xs text-tadaruk-gold font-medium">days</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-semibold block mt-0.5">
              Mercy day grace active
            </span>
          </div>

          <div>
            <span className="text-xs text-slate-400 block">7-Day Completion</span>
            <div className="flex items-baseline space-x-1.5 mt-0.5">
              <span className="text-3xl font-extrabold text-white font-mono">
                {Math.round(
                  (last7Days.reduce((a, b) => a + b.completed, 0) / 35) * 100
                )}
                %
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              {last7Days.reduce((a, b) => a + b.completed, 0)} of 35 Fard
            </span>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <span className="text-xs text-slate-400 block">Qaza Recovery</span>
            <div className="flex items-baseline space-x-1.5 mt-0.5">
              <span className="text-3xl font-extrabold text-white font-mono">
                {Object.values(qazaCounts).reduce((a, b) => a + (b || 0), 0)}
              </span>
              <span className="text-xs text-slate-400">pending</span>
            </div>
            <span className="text-[10px] text-tadaruk-gold block mt-0.5">
              Keep progressing steadily
            </span>
          </div>
        </div>
      </div>

      {/* 7-Day Completion Bar Chart */}
      <div className="bg-tadaruk-card border border-tadaruk-border rounded-3xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BarChart3 size={18} className="text-tadaruk-gold" />
              Weekly Prayer Consistency
            </h3>
            <p className="text-xs text-tadaruk-muted">Daily breakdown out of 5 Fard prayers</p>
          </div>
        </div>

        {/* Custom Bar Graph */}
        <div className="flex items-end justify-between gap-2 h-44 pt-6 px-2">
          {last7Days.map((item, idx) => {
            const heightPct = Math.max(12, Math.round((item.completed / 5) * 100));
            const isFull = item.completed === 5;
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <span className="text-[11px] font-mono font-bold text-slate-300">
                  {item.completed}
                </span>
                <div className="w-full max-w-[36px] bg-slate-900 rounded-xl overflow-hidden p-1 flex items-end h-full">
                  <div
                    className={`w-full rounded-lg transition-all duration-500 ${
                      isFull
                        ? 'bg-gradient-to-t from-emerald-600 to-teal-400 shadow-md shadow-emerald-500/20'
                        : item.completed >= 3
                        ? 'bg-gradient-to-t from-tadaruk-gold to-amber-300'
                        : 'bg-gradient-to-t from-rose-600 to-amber-600'
                    }`}
                    style={{ height: `${heightPct}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-slate-400">
                  {item.dayName}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Most Missed Prayer Diagnostic & Prophetic Wisdom */}
      <div className="bg-tadaruk-card border border-tadaruk-border rounded-3xl p-5 space-y-3">
        <div className="flex items-center space-x-2 text-tadaruk-gold">
          <Lightbulb size={18} />
          <h3 className="font-bold text-sm text-white">Focus Area: {advice.name}</h3>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          {advice.tip}
        </p>

        <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-tadaruk-gold tracking-wider">
            Prophetic Motivation
          </span>
          <p className="text-xs text-slate-300 italic">
            "{advice.hadith}"
          </p>
        </div>
      </div>
    </div>
  );
}
