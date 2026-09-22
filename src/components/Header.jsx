import React from 'react';
import { MapPin, Users, Moon, Sun, Volume2, Sparkles } from 'lucide-react';

export default function Header({
  location,
  hijriDate,
  gregorianDateStr,
  activeProfile,
  profiles,
  onSelectProfile,
  onOpenLocationModal,
  onTestAdhan,
}) {
  return (
    <header className="sticky top-0 z-30 bg-[#080E21]/90 backdrop-blur-md border-b border-tadaruk-border/60 px-4 py-3">
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        {/* Brand & Identity */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-tadaruk-gold to-tadaruk-goldDark flex items-center justify-center shadow-lg shadow-tadaruk-gold/20 text-[#080E21] font-bold text-xl">
            ت
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-extrabold text-lg tracking-tight text-white flex items-center gap-1.5">
                Tadaruk <span className="font-arabic text-tadaruk-gold text-base font-normal">تدارك</span>
              </h1>
              <span className="text-[10px] uppercase tracking-wider bg-tadaruk-card border border-tadaruk-border px-1.5 py-0.5 rounded text-tadaruk-gold">
                Offline
              </span>
            </div>
            <p className="text-xs text-tadaruk-muted font-bangla">
              {hijriDate.formattedBn || hijriDate.formatted}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          {/* Audio Chime test */}
          <button
            onClick={onTestAdhan}
            title="Play Calm Adhan Chime"
            className="w-8 h-8 rounded-lg bg-tadaruk-card border border-tadaruk-border text-tadaruk-gold hover:bg-tadaruk-border/60 flex items-center justify-center transition-colors"
          >
            <Volume2 size={16} />
          </button>

          {/* Active Location Button */}
          <button
            onClick={onOpenLocationModal}
            className="flex items-center space-x-1.5 bg-tadaruk-card hover:bg-tadaruk-border/50 border border-tadaruk-border text-slate-200 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all"
          >
            <MapPin size={13} className="text-tadaruk-gold" />
            <span className="max-w-[80px] truncate">{location.name}</span>
          </button>

          {/* Profile Switcher */}
          {profiles.length > 1 && (
            <select
              value={activeProfile}
              onChange={(e) => onSelectProfile(e.target.value)}
              className="bg-tadaruk-card text-tadaruk-gold border border-tadaruk-border text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-tadaruk-gold"
            >
              {profiles.map((p) => (
                <option key={p.id} value={p.id} className="bg-tadaruk-card text-white">
                  {p.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>
    </header>
  );
}
