/**
 * Local Storage Persistence Layer for Tadaruk
 * Offline-first, reactive, with profile support and JSON backup/restore
 */

const STORAGE_KEY_PREFIX = 'tadaruk_app_';

export const DEFAULT_SETTINGS = {
  method: 'KARACHI',
  asrSchool: 'HANAFI',
  highLatitudeRule: 'ANGLE_BASED',
  altitude: 10,
  customFajrAngle: 18.0,
  customIshaAngle: 18.0,
  location: {
    name: 'Dhaka',
    country: 'Bangladesh',
    lat: 23.8103,
    lng: 90.4125,
    altitude: 10,
  },
  savedLocations: [
    { id: 'loc_home', label: 'Home', name: 'Dhaka', country: 'Bangladesh', lat: 23.8103, lng: 90.4125 },
    { id: 'loc_makkah', label: 'Makkah', name: 'Makkah', country: 'Saudi Arabia', lat: 21.4225, lng: 39.8262 },
  ],
  activeLocationId: 'loc_home',
  activeProfile: 'self',
  savedProfiles: [
    { id: 'self', name: 'My Worship (Primary)' },
    { id: 'family_1', name: 'Family Member' },
  ],
  adhanSound: true,
  tahajjudReminder: false,
  jumuahReminder: true,
  dailyContentNotification: true,
  highContrast: false,
  theme: 'dark',
  hijriAdjustment: 0,
  onboardingCompleted: true,
};

export const DEFAULT_QAZA = {
  fajr: 0,
  dhuhr: 0,
  asr: 0,
  maghrib: 0,
  isha: 0,
  witr: 0,
};

export const DEFAULT_QAZA_PLAN = {
  dailyTarget: 3,
  targetDate: '',
  startDate: new Date().toISOString().split('T')[0],
  initialTotal: 0,
  active: false,
};

export function getStoredData(key, fallback) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PREFIX + key);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Storage read error:', e);
  }
  return fallback;
}

export function setStoredData(key, value) {
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.error('Storage write error:', e);
  }
}

export function exportBackupJson() {
  const allData = {};
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(STORAGE_KEY_PREFIX)) {
      allData[k] = localStorage.getItem(k);
    }
  }
  const payload = {
    app: 'Tadaruk',
    version: '1.0.0',
    exportDate: new Date().toISOString(),
    data: allData,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Tadaruk_Backup_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importBackupJson(file, callback) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const parsed = JSON.parse(e.target.result);
      if (parsed.app === 'Tadaruk' && parsed.data) {
        Object.entries(parsed.data).forEach(([key, val]) => {
          localStorage.setItem(key, val);
        });
        callback({ success: true, message: 'Backup restored successfully!' });
      } else {
        callback({ success: false, message: 'Invalid Tadaruk backup file format.' });
      }
    } catch (err) {
      callback({ success: false, message: 'Failed to read JSON: ' + err.message });
    }
  };
  reader.readAsText(file);
}
