import React, { useState, useEffect } from 'react';
import { Moon, Sun, Clock, Compass, BellRing } from 'lucide-react';
import { formatTime } from '../utils/prayerEngine';

export default function HomeHero({
  completedCount,
  totalFard = 5,
  nextPrayer,
  activePrayer,
  hijriDate,
  gregorianDateStr,
  onOpenQibla,
}) {
  const [timeLeftStr, setTimeLeftStr] = useState('');

  useEffect(() => {
    const updateCountdown = () => {
      if (!nextPrayer || !nextPrayer.time) {
        setTimeLeftStr('--:--:--');
        return;
      }
      const now = new Date();
      const diffMs = nextPrayer.time.getTime() - now.getTime();

      if (diffMs <= 0) {
        setTimeLeftStr('Now');
        return;
      }

      const totalSec = Math.floor(diffMs / 1000);
      const hours = Math.floor(totalSec / 3600);
      const minutes = Math.floor((totalSec % 3600) / 60);
      const seconds = totalSec % 60;

      const pad = (n) => (n < 10 ? '0' + n : n);
      setTimeLeftStr(`${pad(hours)}:${pad(minutes)}:${pad(seconds)}`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [nextPrayer]);

  // SVG Circular Progress calculation
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const progressRatio = Math.min(1, completedCount / totalFard);
  const strokeDashoffset = circumference - progressRatio * circumference;

  // Ramadan Days Calculation
  let ramadanStatusText = '';
  if (hijriDate.month === 9) {
    ramadanStatusText = `Day ${hijriDate.day} of Ramadan المبارك`;
  } else {
    let monthsToRamadan = 9 - hijriDate.month;
    if (monthsToRamadan <= 0) monthsToRamadan += 12;
    const approxDays = Math.max(1, Math.round(monthsToRamadan * 29.53 - hijriDate.day));
    ramadanStatusText = `~${approxDays} days until Ramadan`;
  }

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#111E42] via-[#0E1733] to-tadaruk-card border border-tadaruk-border p-5 sm:p-6 shadow-xl shadow-[#080E21]/50">
      {/* Background Decorative Crescent Glow */}
      <div className="absolute -top-16 -right-16 w-44 h-44 rounded-full bg-tadaruk-gold/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-44 h-44 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left: Next Prayer Countdown */}
        <div className="flex-1 text-center md:text-left">
          <div className="inline-flex items-center space-x-2 bg-tadaruk-card/80 border border-tadaruk-border/80 px-3 py-1 rounded-full text-xs text-tadaruk-gold mb-3">
            <Moon size={13} className="text-tadaruk-gold" />
            <span className="font-medium tracking-wide">{ramadanStatusText}</span>
          </div>

          <div className="space-y-1">
            <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold">
              Next Prayer ({nextPrayer?.nameEn || 'Next'})
            </span>
            <div className="flex items-baseline justify-center md:justify-start gap-2">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-mono">
                {timeLeftStr}
              </h2>
              {nextPrayer?.time && (
                <span className="text-xs text-tadaruk-gold font-medium">
                  at {formatTime(nextPrayer.time)}
                </span>
              )}
            </div>
            <p className="text-xs text-tadaruk-muted pt-1">
              {activePrayer ? (
                <span className="text-emerald-400 font-semibold flex items-center justify-center md:justify-start gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  Active Window: {activePrayer.nameEn} ({activePrayer.nameAr})
                </span>
              ) : (
                <span>May Allah accept your earnest devotion today.</span>
              )}
            </p>
          </div>

          <div className="mt-4 flex items-center justify-center md:justify-start gap-3">
            <button
              onClick={onOpenQibla}
              className="inline-flex items-center gap-1.5 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-200 transition-colors"
            >
              <Compass size={14} className="text-tadaruk-gold" />
              <span>Qibla Compass</span>
            </button>
            <span className="text-xs text-slate-400 font-bangla">
              {gregorianDateStr}
            </span>
          </div>
        </div>

        {/* Right: Circular Progress Ring */}
        <div className="relative flex items-center justify-center">
          <svg className="w-28 h-28 transform -rotate-90">
            {/* Track */}
            <circle
              cx="56"
              cy="56"
              r={radius}
              stroke="currentColor"
              strokeWidth="7"
              fill="transparent"
              className="text-slate-800"
            />
            {/* Progress */}
            <circle
              cx="56"
              cy="56"
              r={radius}
              stroke="currentColor"
              strokeWidth="7"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="text-tadaruk-gold transition-all duration-700 ease-out shadow-lg"
            />
          </svg>

          {/* Inner Content */}
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-black text-white leading-none">
              {completedCount}
              <span className="text-xs font-normal text-slate-400">/{totalFard}</span>
            </span>
            <span className="text-[10px] uppercase tracking-wider text-tadaruk-gold font-semibold mt-0.5">
              Completed
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
