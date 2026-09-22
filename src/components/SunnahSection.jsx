import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Sparkles, Check } from 'lucide-react';
import { formatTime } from '../utils/prayerEngine';
import { triggerHaptic } from '../utils/audioHaptics';

export default function SunnahSection({
  prayerTimes,
  sunnahCompleted,
  onToggleSunnah,
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const sunnahList = [
    {
      key: 'tahajjud',
      name: 'Tahajjud (Night Prayer)',
      arabic: 'تهجد',
      bangla: 'তাহাজ্জুদ',
      rakat: '2-8 Rakats',
      timeDesc: `Best after ${formatTime(prayerTimes.tahajjud)} until Fajr`,
      merit: 'The most virtuous prayer after the obligatory prayers.',
    },
    {
      key: 'duha',
      name: 'Duha / Ishraq',
      arabic: 'ضحى',
      bangla: 'চাশত ও ইশরাক',
      rakat: '2-8 Rakats',
      timeDesc: `From ${formatTime(prayerTimes.duha)} until ~15 min before Dhuhr`,
      merit: 'Fulfills the daily charity due for every joint of the body.',
    },
    {
      key: 'rawatib_fajr',
      name: '2 Sunnah before Fajr',
      arabic: 'سنة الفجر',
      bangla: 'ফজরের ২ রাকাত সুন্নত',
      rakat: '2 Rakats (Muakkadah)',
      timeDesc: 'Before Fajr Fard',
      merit: 'Better than the world and everything within it.',
    },
    {
      key: 'rawatib_dhuhr_before',
      name: '4 Sunnah before Dhuhr',
      arabic: 'سنة الظهر القبلية',
      bangla: 'যোহরের পূর্বের ৪ রাকাত সুন্নত',
      rakat: '4 Rakats (Muakkadah)',
      timeDesc: 'Before Dhuhr Fard',
      merit: 'A house is built in Paradise for consistent adherence.',
    },
    {
      key: 'rawatib_dhuhr_after',
      name: '2 Sunnah after Dhuhr',
      arabic: 'سنة الظهر البعدية',
      bangla: 'যোহরের পরের ২ রাকাত সুন্নত',
      rakat: '2 Rakats',
      timeDesc: 'After Dhuhr Fard',
      merit: 'Shields from the Hellfire.',
    },
    {
      key: 'rawatib_maghrib',
      name: '2 Sunnah after Maghrib',
      arabic: 'سنة المغرب',
      bangla: 'মাগরিবের পরের ২ রাকাত সুন্নত',
      rakat: '2 Rakats (Muakkadah)',
      timeDesc: 'After Maghrib Fard',
      merit: 'Prophetic tradition preserved diligently.',
    },
    {
      key: 'rawatib_isha',
      name: '2 Sunnah after Isha',
      arabic: 'سنة العشاء',
      bangla: 'ইশার পরের ২ রাকাত সুন্নত',
      rakat: '2 Rakats (Muakkadah)',
      timeDesc: 'After Isha Fard',
      merit: 'Strengthens devotion before concluding the night.',
    },
    {
      key: 'witr',
      name: 'Salat al-Witr',
      arabic: 'وتر',
      bangla: 'বিতর সালাত',
      rakat: '1-3 Rakats (Wajib / Muakkadah)',
      timeDesc: 'Between Isha and Fajr dawn',
      merit: 'Allah is One and loves the odd (Witr) prayer.',
    },
  ];

  const completedCount = sunnahList.filter((s) => !!sunnahCompleted[s.key]).length;

  return (
    <div className="bg-tadaruk-card border border-tadaruk-border rounded-2xl p-4 transition-all">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left"
      >
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center border border-amber-500/30">
            <Sparkles size={16} />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
              Sunnah & Nafl Prayers
              <span className="font-arabic text-tadaruk-gold text-xs">النوافل</span>
            </h4>
            <p className="text-xs text-tadaruk-muted">
              {completedCount} of {sunnahList.length} completed today
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-slate-400">
          <span className="text-xs font-semibold bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
            {completedCount}/{sunnahList.length}
          </span>
          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </button>

      {isExpanded && (
        <div className="mt-4 pt-3 border-t border-tadaruk-border/70 space-y-2.5 animate-in fade-in-50 duration-200">
          {sunnahList.map((item) => {
            const isDone = !!sunnahCompleted[item.key];
            return (
              <div
                key={item.key}
                onClick={() => {
                  triggerHaptic('light');
                  onToggleSunnah(item.key);
                }}
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                  isDone
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-slate-200'
                    : 'bg-slate-900/50 border-slate-800/80 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${
                      isDone
                        ? 'bg-emerald-500 text-slate-900 border-emerald-400'
                        : 'border-slate-600 bg-slate-800'
                    }`}
                  >
                    {isDone && <Check size={14} className="stroke-[3]" />}
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs font-semibold ${isDone ? 'line-through opacity-75' : ''}`}>
                        {item.name}
                      </span>
                      <span className="text-[10px] bg-slate-800 text-tadaruk-gold px-1.5 py-0.2 rounded border border-slate-700">
                        {item.rakat}
                      </span>
                    </div>
                    <p className="text-[11px] text-tadaruk-muted mt-0.5">
                      {item.timeDesc} • <span className="italic">{item.merit}</span>
                    </p>
                  </div>
                </div>

                <span className="font-arabic text-xs text-tadaruk-gold/80 ml-2">
                  {item.arabic}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
