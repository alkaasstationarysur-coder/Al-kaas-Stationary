import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Navigation from './components/Navigation';
import HomeHero from './components/HomeHero';
import PrayerCard from './components/PrayerCard';
import SunnahSection from './components/SunnahSection';
import DailyContentCard from './components/DailyContentCard';
import QazaDashboard from './components/QazaDashboard';
import FastingTracker from './components/FastingTracker';
import DhikrTasbih from './components/DhikrTasbih';
import MoreGrid from './components/MoreGrid';
import IslamicContentModal from './components/IslamicContentModal';
import QiblaCompass from './components/QiblaCompass';
import InsightsView from './components/InsightsView';
import LocationSettingsModal from './components/LocationSettingsModal';
import OnboardingModal from './components/OnboardingModal';

import {
  calculatePrayerTimes,
  getHijriDate,
  getActivePrayerWindow,
  getNextPrayer,
} from './utils/prayerEngine';
import {
  getStoredData,
  setStoredData,
  DEFAULT_SETTINGS,
  DEFAULT_QAZA,
  DEFAULT_QAZA_PLAN,
} from './utils/storage';
import { soundEffects } from './utils/audioHaptics';

export default function App() {
  // 1. Settings State
  const [settings, setSettings] = useState(() =>
    getStoredData('settings', DEFAULT_SETTINGS)
  );

  // 2. Active Bottom Navigation Tab
  const [activeTab, setActiveTab] = useState('today');

  // 3. Modals
  const [showKnowledgeModal, setShowKnowledgeModal] = useState(false);
  const [showQiblaModal, setShowQiblaModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showInsightsModal, setShowInsightsModal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(!settings.onboardingCompleted);

  // Current Date Strings
  const todayDate = new Date();
  const todayStr = todayDate.toISOString().split('T')[0];
  const gregorianDateStr = todayDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // Profile Prefix for multi-profile support
  const profileKey = settings.activeProfile || 'self';

  // 4. Data State for Active Profile
  const [prayerLogs, setPrayerLogs] = useState(() =>
    getStoredData(`prayer_logs_${profileKey}`, {})
  );
  const [qazaCounts, setQazaCounts] = useState(() =>
    getStoredData(`qaza_counts_${profileKey}`, DEFAULT_QAZA)
  );
  const [qazaPlan, setQazaPlan] = useState(() =>
    getStoredData(`qaza_plan_${profileKey}`, DEFAULT_QAZA_PLAN)
  );
  const [fastingLogs, setFastingLogs] = useState(() =>
    getStoredData(`fasting_logs_${profileKey}`, {})
  );
  const [qazaFasts, setQazaFasts] = useState(() =>
    getStoredData(`qaza_fasts_${profileKey}`, 0)
  );
  const [adhkarProgress, setAdhkarProgress] = useState(() => {
    // Reset daily if date changed
    const stored = getStoredData(`adhkar_${profileKey}`, { date: todayStr, progress: {} });
    if (stored.date === todayStr) return stored.progress;
    return {};
  });
  const [customDhikrs, setCustomDhikrs] = useState(() =>
    getStoredData(`custom_dhikrs_${profileKey}`, [])
  );
  const [sadaqahLogs, setSadaqahLogs] = useState(() =>
    getStoredData(`sadaqah_logs_${profileKey}`, [])
  );
  const [savedItems, setSavedItems] = useState(() =>
    getStoredData('saved_bookmarks', [])
  );

  // Sync to local storage
  useEffect(() => {
    setStoredData('settings', settings);
  }, [settings]);

  useEffect(() => {
    setStoredData(`prayer_logs_${profileKey}`, prayerLogs);
  }, [prayerLogs, profileKey]);

  useEffect(() => {
    setStoredData(`qaza_counts_${profileKey}`, qazaCounts);
  }, [qazaCounts, profileKey]);

  useEffect(() => {
    setStoredData(`qaza_plan_${profileKey}`, qazaPlan);
  }, [qazaPlan, profileKey]);

  useEffect(() => {
    setStoredData(`fasting_logs_${profileKey}`, fastingLogs);
  }, [fastingLogs, profileKey]);

  useEffect(() => {
    setStoredData(`qaza_fasts_${profileKey}`, qazaFasts);
  }, [qazaFasts, profileKey]);

  useEffect(() => {
    setStoredData(`adhkar_${profileKey}`, { date: todayStr, progress: adhkarProgress });
  }, [adhkarProgress, profileKey, todayStr]);

  useEffect(() => {
    setStoredData(`custom_dhikrs_${profileKey}`, customDhikrs);
  }, [customDhikrs, profileKey]);

  useEffect(() => {
    setStoredData(`sadaqah_logs_${profileKey}`, sadaqahLogs);
  }, [sadaqahLogs, profileKey]);

  useEffect(() => {
    setStoredData('saved_bookmarks', savedItems);
  }, [savedItems]);

  // Handle profile change
  const handleSelectProfile = (pId) => {
    setSettings((prev) => ({ ...prev, activeProfile: pId }));
    setPrayerLogs(getStoredData(`prayer_logs_${pId}`, {}));
    setQazaCounts(getStoredData(`qaza_counts_${pId}`, DEFAULT_QAZA));
    setQazaPlan(getStoredData(`qaza_plan_${pId}`, DEFAULT_QAZA_PLAN));
    setFastingLogs(getStoredData(`fasting_logs_${pId}`, {}));
    setQazaFasts(getStoredData(`qaza_fasts_${pId}`, 0));
  };

  const handleAddProfile = (newP) => {
    setSettings((prev) => ({
      ...prev,
      savedProfiles: [...prev.savedProfiles, newP],
      activeProfile: newP.id,
    }));
    handleSelectProfile(newP.id);
  };

  // 5. Astronomical Calculations
  const prayerTimes = calculatePrayerTimes(
    todayDate,
    settings.location.lat,
    settings.location.lng,
    {
      method: settings.method,
      asrSchool: settings.asrSchool,
      altitude: settings.location.altitude || 10,
    }
  );

  const hijriDate = getHijriDate(todayDate, settings.hijriAdjustment || 0);
  const activePrayerWindow = getActivePrayerWindow(prayerTimes);
  const nextPrayer = getNextPrayer(prayerTimes);

  // Today's prayer log
  const currentDayLog = prayerLogs[todayStr] || {
    fajr: false,
    dhuhr: false,
    asr: false,
    maghrib: false,
    isha: false,
    congregation: {},
    sunnahs: {},
  };

  const fardKeys = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
  const completedFardCount = fardKeys.filter((k) => !!currentDayLog[k]).length;

  // Toggle Fard Prayer Completion
  const handleTogglePrayer = (prayerKey) => {
    const isCompleted = !currentDayLog[prayerKey];
    setPrayerLogs((prev) => ({
      ...prev,
      [todayStr]: {
        ...currentDayLog,
        [prayerKey]: isCompleted,
      },
    }));
  };

  // Toggle Congregation (Jama'ah)
  const handleToggleCongregation = (prayerKey) => {
    const currentCong = currentDayLog.congregation || {};
    setPrayerLogs((prev) => ({
      ...prev,
      [todayStr]: {
        ...currentDayLog,
        congregation: {
          ...currentCong,
          [prayerKey]: !currentCong[prayerKey],
        },
      },
    }));
  };

  // Toggle Sunnah
  const handleToggleSunnah = (sunnahKey) => {
    const currentSunnahs = currentDayLog.sunnahs || {};
    setPrayerLogs((prev) => ({
      ...prev,
      [todayStr]: {
        ...currentDayLog,
        sunnahs: {
          ...currentSunnahs,
          [sunnahKey]: !currentSunnahs[sunnahKey],
        },
      },
    }));
  };

  // Toggle Fasting
  const handleToggleFast = (dateStr, type) => {
    setFastingLogs((prev) => {
      const next = { ...prev };
      if (!type) {
        delete next[dateStr];
      } else {
        next[dateStr] = { type, date: dateStr };
      }
      return next;
    });
  };

  // Toggle Saved Item
  const handleToggleSaveItem = (item) => {
    setSavedItems((prev) => {
      const exists = prev.some((s) => s.id === item.id);
      if (exists) {
        return prev.filter((s) => s.id !== item.id);
      }
      return [...prev, item];
    });
  };

  // Prayers configuration list
  const prayerCardsData = [
    {
      key: 'fajr',
      nameEn: 'Fajr',
      nameAr: 'الفجر',
      nameBn: 'ফজর',
      startTime: prayerTimes.fajr,
      endTime: prayerTimes.sunrise,
    },
    {
      key: 'dhuhr',
      nameEn: 'Dhuhr',
      nameAr: 'الظهر',
      nameBn: 'যোহর',
      startTime: prayerTimes.dhuhr,
      endTime: prayerTimes.asr,
    },
    {
      key: 'asr',
      nameEn: 'Asr',
      nameAr: 'العصر',
      nameBn: 'আসর',
      startTime: prayerTimes.asr,
      endTime: prayerTimes.maghrib,
    },
    {
      key: 'maghrib',
      nameEn: 'Maghrib',
      nameAr: 'المغرب',
      nameBn: 'মাগরিব',
      startTime: prayerTimes.maghrib,
      endTime: prayerTimes.isha,
    },
    {
      key: 'isha',
      nameEn: 'Isha',
      nameAr: 'العشاء',
      nameBn: 'ইশা',
      startTime: prayerTimes.isha,
      endTime: prayerTimes.fajrNext,
    },
  ];

  return (
    <div className="min-h-screen bg-[#080E21] text-slate-100 flex flex-col selection:bg-tadaruk-gold selection:text-slate-950 font-sans pb-24">
      {/* Top Persistent App Header */}
      <Header
        location={settings.location}
        hijriDate={hijriDate}
        gregorianDateStr={gregorianDateStr}
        activeProfile={settings.activeProfile}
        profiles={settings.savedProfiles || []}
        onSelectProfile={handleSelectProfile}
        onOpenLocationModal={() => setShowSettingsModal(true)}
        onTestAdhan={() => soundEffects.playCalmChime()}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-5 space-y-6">
        {/* TAB 1: TODAY (الصلاة) */}
        {activeTab === 'today' && (
          <div className="space-y-6 animate-in fade-in-50 duration-300">
            {/* Hero Countdown & Circular Ring */}
            <HomeHero
              completedCount={completedFardCount}
              totalFard={5}
              nextPrayer={nextPrayer}
              activePrayer={activePrayerWindow}
              hijriDate={hijriDate}
              gregorianDateStr={gregorianDateStr}
              onOpenQibla={() => setShowQiblaModal(true)}
            />

            {/* Daily Fard Prayers List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
                  Obligatory Prayers (الصلوات المفروضة)
                </h3>
                <span className="text-xs text-tadaruk-gold font-medium">
                  {completedFardCount}/5 Completed
                </span>
              </div>

              {prayerCardsData.map((p) => {
                const isCompleted = !!currentDayLog[p.key];
                const isCongregation = !!currentDayLog.congregation?.[p.key];
                const isActive = activePrayerWindow?.key === p.key;
                const isMissed =
                  !isCompleted &&
                  todayDate.getTime() > p.endTime.getTime() &&
                  p.key !== 'isha';

                return (
                  <PrayerCard
                    key={p.key}
                    prayerKey={p.key}
                    nameEn={p.nameEn}
                    nameAr={p.nameAr}
                    nameBn={p.nameBn}
                    startTime={p.startTime}
                    endTime={p.endTime}
                    isCompleted={isCompleted}
                    isCongregation={isCongregation}
                    isActiveWindow={isActive}
                    isMissed={isMissed}
                    onToggleComplete={() => handleTogglePrayer(p.key)}
                    onToggleCongregation={() => handleToggleCongregation(p.key)}
                  />
                );
              })}
            </div>

            {/* Sunnah & Nafl Prayers Tracker */}
            <SunnahSection
              prayerTimes={prayerTimes}
              sunnahCompleted={currentDayLog.sunnahs || {}}
              onToggleSunnah={handleToggleSunnah}
            />

            {/* Daily Verse / Hadith Card */}
            <DailyContentCard
              savedItems={savedItems}
              onToggleSave={handleToggleSaveItem}
            />
          </div>
        )}

        {/* TAB 2: QAZA RECOVERY (القضاء) */}
        {activeTab === 'qaza' && (
          <QazaDashboard
            qazaCounts={qazaCounts}
            onUpdateCount={(key, val) =>
              setQazaCounts((prev) => ({ ...prev, [key]: val }))
            }
            onSetAllCounts={(newCounts) => setQazaCounts(newCounts)}
            qazaPlan={qazaPlan}
            onUpdatePlan={(newPlan) => setQazaPlan(newPlan)}
          />
        )}

        {/* TAB 3: FASTING TRACKER (الصيام) */}
        {activeTab === 'fasting' && (
          <FastingTracker
            fastingLogs={fastingLogs}
            onToggleFast={handleToggleFast}
            qazaFasts={qazaFasts}
            onUpdateQazaFasts={(val) => setQazaFasts(val)}
            hijriDate={hijriDate}
          />
        )}

        {/* TAB 4: DHIKR & TASBIH (الذكر) */}
        {activeTab === 'dhikr' && (
          <DhikrTasbih
            adhkarProgress={adhkarProgress}
            onUpdateAdhkarProgress={(id, val) =>
              setAdhkarProgress((prev) => ({ ...prev, [id]: val }))
            }
            customDhikrs={customDhikrs}
            onAddCustomDhikr={(newD) =>
              setCustomDhikrs((prev) => [...prev, newD])
            }
            onDeleteCustomDhikr={(id) =>
              setCustomDhikrs((prev) => prev.filter((d) => d.id !== id))
            }
            sadaqahLogs={sadaqahLogs}
            onAddSadaqahLog={(newLog) =>
              setSadaqahLogs((prev) => [newLog, ...prev])
            }
          />
        )}

        {/* TAB 5: MORE (المزيد) */}
        {activeTab === 'more' && (
          <MoreGrid
            onOpenKnowledge={() => setShowKnowledgeModal(true)}
            onOpenQibla={() => setShowQiblaModal(true)}
            onOpenInsights={() => setShowInsightsModal(true)}
            onOpenSettings={() => setShowSettingsModal(true)}
            activeProfile={settings.activeProfile}
            profiles={settings.savedProfiles || []}
            onSelectProfile={handleSelectProfile}
            onAddProfile={handleAddProfile}
          />
        )}
      </main>

      {/* Bottom Sticky Navigation */}
      <Navigation activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* MODALS */}
      {/* 1. Islamic Content Treasury */}
      {showKnowledgeModal && (
        <IslamicContentModal
          savedItems={savedItems}
          onToggleSave={handleToggleSaveItem}
          onClose={() => setShowKnowledgeModal(false)}
        />
      )}

      {/* 2. Qibla Compass */}
      {showQiblaModal && (
        <QiblaCompass
          location={settings.location}
          onClose={() => setShowQiblaModal(false)}
        />
      )}

      {/* 3. Worship Insights */}
      {showInsightsModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
          <div className="bg-tadaruk-card border border-tadaruk-border rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative">
            <button
              onClick={() => setShowInsightsModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
            >
              ✕
            </button>
            <InsightsView prayerLogs={prayerLogs} qazaCounts={qazaCounts} />
          </div>
        </div>
      )}

      {/* 4. Location & Calculation Settings */}
      {showSettingsModal && (
        <LocationSettingsModal
          settings={settings}
          onUpdateSettings={setSettings}
          onClose={() => setShowSettingsModal(false)}
        />
      )}

      {/* 5. Onboarding Modal */}
      {showOnboarding && (
        <OnboardingModal
          settings={settings}
          onUpdateSettings={setSettings}
          onSetQazaBacklog={(backlog) => setQazaCounts(backlog)}
          onComplete={() => setShowOnboarding(false)}
        />
      )}
    </div>
  );
}
