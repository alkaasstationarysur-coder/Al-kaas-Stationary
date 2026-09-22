import React from 'react';
import {
  BookOpen,
  Compass,
  TrendingUp,
  MapPin,
  Settings,
  Download,
  Users,
  Heart,
  Shield,
  HelpCircle,
  Sparkles,
} from 'lucide-react';

export default function MoreGrid({
  onOpenKnowledge,
  onOpenQibla,
  onOpenInsights,
  onOpenSettings,
  activeProfile,
  profiles,
  onSelectProfile,
  onAddProfile,
}) {
  const items = [
    {
      id: 'knowledge',
      title: 'Knowledge Sanctuary',
      arabic: 'المعرفة',
      desc: 'Daily Duas, 99 Names of Allah & Islamic Events',
      icon: BookOpen,
      action: onOpenKnowledge,
      badge: 'Offline Library',
    },
    {
      id: 'qibla',
      title: 'Qibla Direction',
      arabic: 'القبلة',
      desc: 'Sensor-aligned compass with Kaaba bearing lock',
      icon: Compass,
      action: onOpenQibla,
      badge: 'Precise',
    },
    {
      id: 'insights',
      title: 'Worship Insights',
      arabic: 'البصيرة',
      desc: 'Prayer consistency trends & diagnostic advice',
      icon: TrendingUp,
      action: onOpenInsights,
      badge: 'Reflective',
    },
    {
      id: 'settings',
      title: 'Calculation & Location',
      arabic: 'الإعدادات',
      desc: 'Bangladeshi cities, Hanafi/Standard Asr & methods',
      icon: Settings,
      action: onOpenSettings,
      badge: 'Configurable',
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      {/* Title */}
      <div>
        <h2 className="text-xl font-black text-white">More Companions</h2>
        <p className="text-xs text-tadaruk-muted">
          Quiet spiritual utilities designed for mindful devotion
        </p>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={item.action}
              className="bg-tadaruk-card border border-tadaruk-border hover:border-slate-600 rounded-3xl p-5 text-left flex flex-col justify-between transition-all duration-200 hover:shadow-lg group active:scale-[0.99]"
            >
              <div className="flex items-start justify-between w-full">
                <div className="w-10 h-10 rounded-2xl bg-slate-900 border border-slate-800 text-tadaruk-gold flex items-center justify-center group-hover:border-tadaruk-gold/40 group-hover:scale-105 transition-all">
                  <Icon size={20} />
                </div>
                <span className="text-[10px] uppercase tracking-wider font-semibold text-tadaruk-gold/80 bg-slate-900/60 px-2 py-0.5 rounded-full border border-slate-800">
                  {item.badge}
                </span>
              </div>

              <div className="mt-4">
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-sm text-white group-hover:text-tadaruk-gold transition-colors">
                    {item.title}
                  </h3>
                  <span className="font-arabic text-xs text-tadaruk-gold font-normal">
                    {item.arabic}
                  </span>
                </div>
                <p className="text-xs text-tadaruk-muted mt-1 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Multi-Profile Mode (§10 Extras) */}
      <div className="bg-tadaruk-card border border-tadaruk-border rounded-3xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Users size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Multi-Profile Mode</h3>
              <p className="text-[11px] text-tadaruk-muted">
                Track for yourself, a family member, or an elderly relative
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {profiles.map((p) => (
            <button
              key={p.id}
              onClick={() => onSelectProfile(p.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                activeProfile === p.id
                  ? 'bg-tadaruk-gold text-slate-950 border-tadaruk-gold font-bold shadow-sm'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              {p.name}
            </button>
          ))}
          <button
            onClick={() => {
              const name = prompt('Enter name for the new profile:');
              if (name && name.trim()) {
                onAddProfile({ id: 'prof_' + Date.now(), name: name.trim() });
              }
            }}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 text-tadaruk-gold border border-slate-800 hover:border-slate-700"
          >
            + Add Profile
          </button>
        </div>
      </div>

      {/* App Creed & Privacy Commitment */}
      <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-2xl flex items-center space-x-3 text-xs text-slate-400">
        <Shield size={18} className="text-emerald-400 shrink-0" />
        <p className="leading-relaxed">
          <strong>Offline & Private:</strong> Tadaruk does not track, collect, or upload your data. Calculations run locally on your device using astronomical equations.
        </p>
      </div>
    </div>
  );
}
