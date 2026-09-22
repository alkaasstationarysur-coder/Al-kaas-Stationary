import React, { useState } from 'react';
import { Sparkles, MapPin, Check, ArrowRight, Heart } from 'lucide-react';
import { BANGLADESH_CITIES } from '../data/cities';
import { triggerHaptic } from '../utils/audioHaptics';

export default function OnboardingModal({ onComplete, settings, onUpdateSettings, onSetQazaBacklog }) {
  const [step, setStep] = useState(1);
  const [selectedCity, setSelectedCity] = useState(settings.location);
  const [asrSchool, setAsrSchool] = useState(settings.asrSchool || 'HANAFI');
  const [hasBacklog, setHasBacklog] = useState(false);
  const [backlogCounts, setBacklogCounts] = useState({
    fajr: 0,
    dhuhr: 0,
    asr: 0,
    maghrib: 0,
    isha: 0,
    witr: 0,
  });

  const handleFinish = () => {
    triggerHaptic('success');
    onUpdateSettings({
      ...settings,
      location: selectedCity,
      asrSchool,
      onboardingCompleted: true,
    });
    if (hasBacklog) {
      onSetQazaBacklog(backlogCounts);
    }
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-tadaruk-card border border-tadaruk-border rounded-3xl w-full max-w-md p-6 space-y-6 shadow-2xl animate-in zoom-in-95">
        {/* Step Indicator */}
        <div className="flex items-center justify-center space-x-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                step === s ? 'w-8 bg-tadaruk-gold' : 'w-2 bg-slate-700'
              }`}
            />
          ))}
        </div>

        {/* STEP 1: WELCOME & PHILOSOPHY */}
        {step === 1 && (
          <div className="text-center space-y-4 animate-in fade-in-50">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-tadaruk-gold to-tadaruk-goldDark mx-auto flex items-center justify-center text-slate-950 font-black text-3xl shadow-xl shadow-tadaruk-gold/20">
              ت
            </div>

            <div>
              <h2 className="text-2xl font-black text-white">
                Welcome to Tadaruk <span className="font-arabic text-tadaruk-gold font-normal">تدارك</span>
              </h2>
              <p className="text-xs text-tadaruk-gold font-medium mt-0.5">
                "To make amends • To catch up • To remedy"
              </p>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed max-w-xs mx-auto">
              A calm, respectful Islamic sanctuary built for peaceful worship tracking, judgment-free Qaza recovery, and daily devotion.
            </p>

            <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 text-[11px] text-tadaruk-muted text-left space-y-1.5">
              <div className="flex items-center gap-2 text-slate-200">
                <Check size={14} className="text-emerald-400" />
                <span>100% Offline with Astronomical Math</span>
              </div>
              <div className="flex items-center gap-2 text-slate-200">
                <Check size={14} className="text-emerald-400" />
                <span>Zero tracking, zero ads, completely private</span>
              </div>
            </div>

            <button
              onClick={() => {
                triggerHaptic('light');
                setStep(2);
              }}
              className="w-full py-3 bg-tadaruk-gold hover:bg-tadaruk-goldLight text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all"
            >
              <span>Begin Your Journey</span>
              <ArrowRight size={14} />
            </button>
          </div>
        )}

        {/* STEP 2: LOCATION & ASR SCHOOL */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in-50">
            <div>
              <h3 className="text-lg font-bold text-white">Location & Calculation</h3>
              <p className="text-xs text-tadaruk-muted">
                Pre-configured for Bangladesh (Karachi method & Hanafi Asr)
              </p>
            </div>

            {/* City Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Select City</label>
              <select
                value={selectedCity.name}
                onChange={(e) => {
                  const found = BANGLADESH_CITIES.find((c) => c.name === e.target.value);
                  if (found) setSelectedCity(found);
                }}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5 text-xs focus:outline-none focus:border-tadaruk-gold"
              >
                {BANGLADESH_CITIES.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name} {c.nameBn ? `(${c.nameBn})` : ''} - {c.country}
                  </option>
                ))}
              </select>
            </div>

            {/* Asr Juristic Method */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Asr Method</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAsrSchool('HANAFI')}
                  className={`p-2.5 rounded-xl border text-xs text-left ${
                    asrSchool === 'HANAFI'
                      ? 'bg-tadaruk-gold/15 border-tadaruk-gold text-white font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-300'
                  }`}
                >
                  Hanafi (Standard in BD)
                </button>
                <button
                  type="button"
                  onClick={() => setAsrSchool('STANDARD')}
                  className={`p-2.5 rounded-xl border text-xs text-left ${
                    asrSchool === 'STANDARD'
                      ? 'bg-tadaruk-gold/15 border-tadaruk-gold text-white font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-300'
                  }`}
                >
                  Standard (Shafi'i/Hanbali)
                </button>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setStep(1)}
                className="py-3 px-4 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl"
              >
                Back
              </button>
              <button
                onClick={() => {
                  triggerHaptic('light');
                  setStep(3);
                }}
                className="flex-1 py-3 bg-tadaruk-gold text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2"
              >
                <span>Continue</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: OPTIONAL BACKLOG ENTRY */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in-50">
            <div>
              <h3 className="text-lg font-bold text-white">Qaza Recovery Ledger</h3>
              <p className="text-xs text-tadaruk-muted">
                Do you have missed prayers you wish to record and pay off?
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setHasBacklog(false)}
                className={`flex-1 p-3 rounded-xl border text-xs font-bold ${
                  !hasBacklog
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                Start Clean (0 Qaza)
              </button>
              <button
                type="button"
                onClick={() => setHasBacklog(true)}
                className={`flex-1 p-3 rounded-xl border text-xs font-bold ${
                  hasBacklog
                    ? 'bg-tadaruk-gold/20 text-tadaruk-gold border-tadaruk-gold'
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                I Have Backlog
              </button>
            </div>

            {hasBacklog && (
              <div className="grid grid-cols-3 gap-2 pt-2">
                {['fajr', 'dhuhr', 'asr', 'maghrib', 'isha', 'witr'].map((k) => (
                  <div key={k} className="space-y-1">
                    <label className="text-[10px] text-slate-300 uppercase font-semibold">
                      {k}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={backlogCounts[k] || ''}
                      onChange={(e) =>
                        setBacklogCounts({
                          ...backlogCounts,
                          [k]: Math.max(0, parseInt(e.target.value, 10) || 0),
                        })
                      }
                      placeholder="0"
                      className="w-full bg-slate-900 border border-slate-700 text-white font-mono rounded-lg p-1.5 text-xs text-center"
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setStep(2)}
                className="py-3 px-4 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl"
              >
                Back
              </button>
              <button
                onClick={handleFinish}
                className="flex-1 py-3 bg-tadaruk-gold hover:bg-tadaruk-goldLight text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-tadaruk-gold/20"
              >
                <Check size={16} />
                <span>Enter Sanctuary</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
