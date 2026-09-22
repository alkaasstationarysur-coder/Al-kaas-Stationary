import React from 'react';
import { Check, Users, Clock, AlertCircle } from 'lucide-react';
import { formatTime } from '../utils/prayerEngine';
import { triggerHaptic } from '../utils/audioHaptics';

export default function PrayerCard({
  prayerKey,
  nameEn,
  nameAr,
  nameBn,
  startTime,
  endTime,
  isCompleted,
  isCongregation,
  isActiveWindow,
  isMissed,
  onToggleComplete,
  onToggleCongregation,
}) {
  const handleCheck = () => {
    triggerHaptic(isCompleted ? 'light' : 'medium');
    onToggleComplete();
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-4 transition-all duration-300 border ${
        isActiveWindow
          ? 'bg-gradient-to-r from-tadaruk-card via-[#16254F] to-tadaruk-card border-tadaruk-gold shadow-lg shadow-tadaruk-gold/10'
          : isCompleted
          ? 'bg-tadaruk-card/70 border-tadaruk-border/80'
          : 'bg-tadaruk-card border-tadaruk-border hover:border-slate-600'
      }`}
    >
      {/* Active Prayer Glow Bar */}
      {isActiveWindow && (
        <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-tadaruk-gold to-tadaruk-goldDark" />
      )}

      <div className="flex items-center justify-between">
        {/* Left: Info */}
        <div className="flex items-center space-x-3.5">
          {/* Checkmark Button */}
          <button
            onClick={handleCheck}
            aria-label={`Mark ${nameEn} as ${isCompleted ? 'incomplete' : 'completed'}`}
            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 transform active:scale-95 ${
              isCompleted
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm shadow-emerald-500/20'
                : isActiveWindow
                ? 'bg-tadaruk-gold/15 text-tadaruk-gold border border-tadaruk-gold/40 hover:bg-tadaruk-gold/25'
                : 'bg-slate-800/80 text-slate-400 border border-slate-700/80 hover:border-slate-500'
            }`}
          >
            {isCompleted ? (
              <Check size={22} className="stroke-[2.8] animate-in zoom-in-50 duration-200" />
            ) : (
              <div className="w-4 h-4 rounded-full border-2 border-current opacity-60" />
            )}
          </button>

          <div>
            <div className="flex items-center space-x-2">
              <h3 className={`font-bold text-base ${isCompleted ? 'text-slate-300 line-through opacity-80' : 'text-white'}`}>
                {nameEn}
              </h3>
              <span className="font-arabic text-sm text-tadaruk-gold font-normal">
                {nameAr}
              </span>
              {isActiveWindow && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-tadaruk-gold/20 text-tadaruk-gold px-2 py-0.5 rounded-full animate-pulse border border-tadaruk-gold/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-tadaruk-gold animate-ping"></span>
                  Active Now
                </span>
              )}
              {isMissed && !isCompleted && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded border border-rose-500/30">
                  <AlertCircle size={10} />
                  Qaza
                </span>
              )}
            </div>

            <p className="text-xs text-tadaruk-muted flex items-center gap-1.5 mt-0.5 font-medium">
              <Clock size={12} className="text-slate-400" />
              <span>{formatTime(startTime)}</span>
              {endTime && <span className="opacity-60">→ {formatTime(endTime)}</span>}
              <span className="text-[11px] opacity-75 font-bangla ml-1">({nameBn})</span>
            </p>
          </div>
        </div>

        {/* Right: Optional Jama'ah Toggle */}
        <div className="flex items-center space-x-2">
          {isCompleted && (
            <button
              onClick={onToggleCongregation}
              title="Prayed in Congregation (Jama'ah)"
              className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-xs transition-colors border ${
                isCongregation
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 font-semibold'
                  : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users size={13} />
              <span className="text-[11px] hidden sm:inline">Jama'ah</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
