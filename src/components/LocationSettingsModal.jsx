import React, { useState } from 'react';
import {
  MapPin,
  Navigation,
  Compass,
  Settings,
  Download,
  Upload,
  Check,
  Globe,
  Sliders,
  Bell,
  Volume2,
  Users,
} from 'lucide-react';
import { BANGLADESH_CITIES, WORLD_CITIES } from '../data/cities';
import { exportBackupJson, importBackupJson } from '../utils/storage';
import { triggerHaptic } from '../utils/audioHaptics';

export default function LocationSettingsModal({
  settings,
  onUpdateSettings,
  onClose,
}) {
  const [activeTab, setActiveTab] = useState('location'); // 'location' | 'calc' | 'profiles' | 'backup'
  const [citySearch, setCitySearch] = useState('');
  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState('');

  // Manual Coordinates state
  const [manualLat, setManualLat] = useState(settings.location.lat.toString());
  const [manualLng, setManualLng] = useState(settings.location.lng.toString());
  const [manualName, setManualName] = useState(settings.location.name);

  // Filtered Cities
  const allCities = [...BANGLADESH_CITIES, ...WORLD_CITIES];
  const filteredCities = allCities.filter(
    (c) =>
      c.name.toLowerCase().includes(citySearch.toLowerCase()) ||
      c.country.toLowerCase().includes(citySearch.toLowerCase()) ||
      (c.nameBn && c.nameBn.includes(citySearch))
  );

  // GPS Location Fix
  const handleGpsFix = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your device.');
      return;
    }
    setIsGpsLoading(true);
    setGpsError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsGpsLoading(false);
        const { latitude, longitude, altitude } = position.coords;
        triggerHaptic('success');
        onUpdateSettings({
          ...settings,
          location: {
            name: 'GPS Location',
            country: 'Custom',
            lat: parseFloat(latitude.toFixed(4)),
            lng: parseFloat(longitude.toFixed(4)),
            altitude: altitude || 10,
          },
        });
      },
      (err) => {
        setIsGpsLoading(false);
        setGpsError('Could not retrieve location: ' + err.message);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSelectCity = (city) => {
    triggerHaptic('light');
    onUpdateSettings({
      ...settings,
      location: {
        name: city.name,
        country: city.country,
        lat: city.lat,
        lng: city.lng,
        altitude: city.altitude || 10,
      },
    });
  };

  const handleSaveManualCoords = () => {
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);
    if (!isNaN(lat) && !isNaN(lng)) {
      triggerHaptic('success');
      onUpdateSettings({
        ...settings,
        location: {
          name: manualName.trim() || 'Custom Coordinates',
          country: 'Manual',
          lat,
          lng,
          altitude: 10,
        },
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
      <div className="bg-tadaruk-card border border-tadaruk-border rounded-3xl w-full max-w-xl h-[88vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-tadaruk-border flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-tadaruk-gold/20 text-tadaruk-gold flex items-center justify-center">
              <Settings size={18} />
            </div>
            <div>
              <h2 className="font-bold text-base text-white">Location & Calculation Setup</h2>
              <p className="text-xs text-tadaruk-muted">
                Active: {settings.location.name} ({settings.location.lat}°, {settings.location.lng}°)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-sm"
          >
            ✕
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center px-4 pt-2 border-b border-tadaruk-border/70 gap-2 overflow-x-auto">
          {[
            { id: 'location', label: 'Offline Cities', icon: MapPin },
            { id: 'calc', label: 'Calculation Methods', icon: Sliders },
            { id: 'reminders', label: 'Notifications', icon: Bell },
            { id: 'backup', label: 'Backup & Restore', icon: Download },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-1.5 py-2.5 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-tadaruk-gold text-tadaruk-gold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* TAB 1: LOCATION PICKER */}
          {activeTab === 'location' && (
            <div className="space-y-4">
              {/* GPS Button */}
              <div className="flex items-center justify-between p-3.5 bg-slate-900/80 border border-slate-800 rounded-2xl">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                    <Navigation size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">One-Shot GPS Detection</h4>
                    <p className="text-[11px] text-tadaruk-muted">Reads sensor coordinates once, zero tracking</p>
                  </div>
                </div>

                <button
                  onClick={handleGpsFix}
                  disabled={isGpsLoading}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 shadow-sm transition-all"
                >
                  {isGpsLoading ? 'Locating...' : 'Get GPS'}
                </button>
              </div>

              {gpsError && (
                <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs">
                  {gpsError}
                </div>
              )}

              {/* City Search Bar */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">
                  Search 40+ Pre-Bundled Cities (Bangladesh & Worldwide)
                </label>
                <input
                  type="text"
                  value={citySearch}
                  onChange={(e) => setCitySearch(e.target.value)}
                  placeholder="e.g. Dhaka, Chittagong, Sylhet, London, New York..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-tadaruk-gold"
                />
              </div>

              {/* City List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                {filteredCities.map((city, idx) => {
                  const isSelected =
                    settings.location.name === city.name &&
                    settings.location.country === city.country;

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectCity(city)}
                      className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                        isSelected
                          ? 'bg-tadaruk-gold/15 border-tadaruk-gold text-white font-bold'
                          : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="text-xs">{city.name}</span>
                          {city.nameBn && (
                            <span className="text-[10px] text-tadaruk-gold font-bangla">
                              ({city.nameBn})
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-tadaruk-muted">{city.country}</span>
                      </div>
                      {isSelected && <Check size={14} className="text-tadaruk-gold" />}
                    </button>
                  );
                })}
              </div>

              {/* Manual Coordinates Input */}
              <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-3">
                <h4 className="text-xs font-bold text-white">Custom Coordinates</h4>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Place Name</label>
                    <input
                      type="text"
                      value={manualName}
                      onChange={(e) => setManualName(e.target.value)}
                      placeholder="My Mosque"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      value={manualLat}
                      onChange={(e) => setManualLat(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-1.5 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      value={manualLng}
                      onChange={(e) => setManualLng(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-1.5 text-xs text-white font-mono"
                    />
                  </div>
                </div>
                <button
                  onClick={handleSaveManualCoords}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 rounded-xl"
                >
                  Apply Custom Coordinates
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: CALCULATION METHODS */}
          {activeTab === 'calc' && (
            <div className="space-y-4 text-xs">
              {/* Calculation Convention */}
              <div className="space-y-2">
                <label className="font-bold text-slate-200 block">Calculation Method</label>
                {[
                  { id: 'KARACHI', name: 'Univ. of Islamic Sciences, Karachi (18° / 18°)', desc: 'Standard in Bangladesh, Pakistan, India.' },
                  { id: 'MWL', name: 'Muslim World League (MWL) (18° / 17°)', desc: 'Standard in Europe, Far East.' },
                  { id: 'ISNA', name: 'ISNA (North America) (15° / 15°)', desc: 'Standard across USA and Canada.' },
                  { id: 'EGYPT', name: 'Egyptian General Authority (19.5° / 17.5°)', desc: 'Standard in Egypt, Africa, Syria, Lebanon.' },
                  { id: 'UMM_AL_QURA', name: 'Umm al-Qura, Makkah (18.5° / 90 min)', desc: 'Official calendar of Saudi Arabia.' },
                ].map((m) => (
                  <div
                    key={m.id}
                    onClick={() => onUpdateSettings({ ...settings, method: m.id })}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      settings.method === m.id
                        ? 'bg-tadaruk-gold/15 border-tadaruk-gold text-white'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{m.name}</span>
                      {settings.method === m.id && <Check size={14} className="text-tadaruk-gold" />}
                    </div>
                    <p className="text-[11px] text-tadaruk-muted mt-0.5">{m.desc}</p>
                  </div>
                ))}
              </div>

              {/* Asr Juristic School */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="font-bold text-slate-200 block">Asr Juristic Method</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onUpdateSettings({ ...settings, asrSchool: 'HANAFI' })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      settings.asrSchool === 'HANAFI'
                        ? 'bg-tadaruk-gold/15 border-tadaruk-gold text-white'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="font-bold">Hanafi (Shadow 2x)</div>
                    <p className="text-[10px] text-tadaruk-muted mt-0.5">
                      Standard in Bangladesh & Subcontinent
                    </p>
                  </button>

                  <button
                    onClick={() => onUpdateSettings({ ...settings, asrSchool: 'STANDARD' })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      settings.asrSchool === 'STANDARD'
                        ? 'bg-tadaruk-gold/15 border-tadaruk-gold text-white'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="font-bold">Standard (Shafi'i, Maliki, Hanbali)</div>
                    <p className="text-[10px] text-tadaruk-muted mt-0.5">
                      Shadow 1x (Earlier Asr time)
                    </p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: NOTIFICATIONS & REMINDERS */}
          {activeTab === 'reminders' && (
            <div className="space-y-3 text-xs">
              {[
                {
                  key: 'adhanSound',
                  title: 'Calm Adhan Chime Tone',
                  desc: 'Soft harmonic tone when prayer time arrives',
                },
                {
                  key: 'tahajjudReminder',
                  title: 'Tahajjud Window Reminder',
                  desc: 'Surfaces prompt during the last third of the night',
                },
                {
                  key: 'jumuahReminder',
                  title: 'Jumuah & Surah Al-Kahf Reminder',
                  desc: 'Friday morning reminder for Surah Kahf and Durood',
                },
              ].map((item) => (
                <div
                  key={item.key}
                  className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-2xl flex items-center justify-between"
                >
                  <div>
                    <h4 className="font-bold text-white">{item.title}</h4>
                    <p className="text-[11px] text-tadaruk-muted">{item.desc}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={!!settings[item.key]}
                    onChange={(e) =>
                      onUpdateSettings({ ...settings, [item.key]: e.target.checked })
                    }
                    className="w-4 h-4 accent-tadaruk-gold rounded cursor-pointer"
                  />
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: BACKUP & RESTORE */}
          {activeTab === 'backup' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3">
                <h4 className="font-bold text-white flex items-center gap-2">
                  <Download size={16} className="text-tadaruk-gold" />
                  Offline Data Sovereignty
                </h4>
                <p className="text-slate-300 leading-relaxed">
                  Your worship records, qaza ledger, and journal reside purely on your device. You can download a complete offline JSON file to preserve your records or transfer to another phone.
                </p>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={exportBackupJson}
                    className="flex-1 py-2.5 bg-tadaruk-gold hover:bg-tadaruk-goldLight text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all"
                  >
                    <Download size={14} />
                    Export Backup JSON
                  </button>
                </div>
              </div>

              <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3">
                <h4 className="font-bold text-white flex items-center gap-2">
                  <Upload size={16} className="text-emerald-400" />
                  Restore from JSON
                </h4>
                <p className="text-slate-300 leading-relaxed">
                  Select a previously exported Tadaruk backup file to restore your prayers and qaza count.
                </p>

                <input
                  type="file"
                  accept=".json"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      importBackupJson(file, (res) => {
                        alert(res.message);
                        if (res.success) {
                          window.location.reload();
                        }
                      });
                    }
                  }}
                  className="block w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-tadaruk-gold hover:file:bg-slate-700 cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
