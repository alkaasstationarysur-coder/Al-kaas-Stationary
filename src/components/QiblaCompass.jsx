import React, { useState, useEffect } from 'react';
import { Compass, RotateCw, CheckCircle2, ShieldCheck, MapPin } from 'lucide-react';
import { calculateQiblaBearing } from '../utils/prayerEngine';
import { triggerHaptic, soundEffects } from '../utils/audioHaptics';

export default function QiblaCompass({ location, onClose }) {
  const [deviceHeading, setDeviceHeading] = useState(0);
  const [hasCompassSensor, setHasCompassSensor] = useState(false);
  const [isCalibrated, setIsCalibrated] = useState(true);
  const [manualAdjustment, setManualAdjustment] = useState(0);

  const qiblaAngle = Math.round(calculateQiblaBearing(location.lat, location.lng));

  // Compute distance to Kaaba (Makkah: 21.4225 N, 39.8262 E) via Haversine formula
  const getDistanceToKaaba = () => {
    const R = 6371; // km
    const dLat = ((21.4225 - location.lat) * Math.PI) / 180;
    const dLon = ((39.8262 - location.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((location.lat * Math.PI) / 180) *
        Math.cos((21.4225 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  };

  useEffect(() => {
    const handleOrientation = (e) => {
      let compass = null;
      if (e.webkitCompassHeading) {
        // iOS devices
        compass = e.webkitCompassHeading;
      } else if (e.alpha !== null) {
        // Android devices
        compass = 360 - e.alpha;
      }

      if (compass !== null && !isNaN(compass)) {
        setHasCompassSensor(true);
        // Exponential smoothing for steady needle
        setDeviceHeading((prev) => {
          let diff = compass - prev;
          while (diff < -180) diff += 360;
          while (diff > 180) diff -= 360;
          return (prev + diff * 0.2 + 360) % 360;
        });
      }
    };

    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation, true);
    }
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  const currentHeading = hasCompassSensor ? deviceHeading : manualAdjustment;
  const needleRotation = (qiblaAngle - currentHeading + 360) % 360;
  const isAligned = Math.abs(needleRotation) < 4 || Math.abs(needleRotation - 360) < 4;

  useEffect(() => {
    if (isAligned) {
      triggerHaptic('success');
    }
  }, [isAligned]);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-tadaruk-card border border-tadaruk-border rounded-3xl w-full max-w-md p-6 flex flex-col items-center text-center space-y-5 shadow-2xl animate-in zoom-in-95">
        {/* Header */}
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Compass className="text-tadaruk-gold" size={20} />
            <h3 className="font-extrabold text-base text-white">Qibla Direction</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        {/* Location Info & Distance */}
        <div className="bg-slate-900/80 px-4 py-2 rounded-2xl border border-slate-800 flex items-center justify-between w-full text-xs">
          <div className="flex items-center space-x-1.5 text-slate-300">
            <MapPin size={13} className="text-tadaruk-gold" />
            <span>{location.name}</span>
          </div>
          <span className="text-tadaruk-gold font-mono font-bold">
            {getDistanceToKaaba().toLocaleString()} km to Kaaba
          </span>
        </div>

        {/* Compass Dial */}
        <div className="relative w-64 h-64 flex items-center justify-center">
          {/* Compass Ring */}
          <div
            className={`absolute inset-0 rounded-full border-4 transition-colors duration-300 ${
              isAligned
                ? 'border-emerald-500 shadow-xl shadow-emerald-500/30 bg-emerald-950/20'
                : 'border-slate-700 bg-slate-950/60'
            }`}
          >
            {/* Cardinal Marks */}
            <span className="absolute top-2 left-1/2 -translate-x-1/2 text-xs font-bold text-rose-400">N</span>
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">E</span>
            <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs font-bold text-slate-400">S</span>
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">W</span>
          </div>

          {/* Rotating Qibla Needle */}
          <div
            className="absolute inset-0 flex items-center justify-center transition-transform duration-200 ease-out pointer-events-none"
            style={{ transform: `rotate(${needleRotation}deg)` }}
          >
            {/* Kaaba Marker on needle tip */}
            <div className="absolute top-4 flex flex-col items-center">
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shadow-lg ${
                  isAligned
                    ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/40 animate-pulse'
                    : 'bg-gradient-to-b from-tadaruk-gold to-tadaruk-goldDark text-slate-950 shadow-tadaruk-gold/40'
                }`}
              >
                🕋
              </div>
              <div className="w-1 h-16 bg-gradient-to-b from-tadaruk-gold to-transparent rounded-full mt-1" />
            </div>
          </div>

          {/* Center Hub */}
          <div className="relative z-10 w-20 h-20 rounded-full bg-slate-900 border-2 border-tadaruk-border flex flex-col items-center justify-center shadow-lg">
            <span className="text-xl font-mono font-extrabold text-white">
              {qiblaAngle}°
            </span>
            <span className="text-[9px] uppercase tracking-wider text-tadaruk-gold font-bold">
              Bearing
            </span>
          </div>
        </div>

        {/* Alignment Status */}
        {isAligned ? (
          <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/30 animate-bounce">
            <CheckCircle2 size={16} />
            <span>Directly Facing the Holy Kaaba!</span>
          </div>
        ) : (
          <p className="text-xs text-tadaruk-muted">
            Rotate your device until the Kaaba icon points straight up to {qiblaAngle}°.
          </p>
        )}

        {/* Manual Fallback Slider if Sensor Unavailable */}
        {!hasCompassSensor && (
          <div className="w-full space-y-2 pt-2 border-t border-slate-800">
            <span className="text-[11px] text-slate-400 block">
              Device compass sensor not detected. Manually rotate phone heading:
            </span>
            <input
              type="range"
              min="0"
              max="359"
              value={manualAdjustment}
              onChange={(e) => setManualAdjustment(parseInt(e.target.value, 10))}
              className="w-full accent-tadaruk-gold"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>0° (North)</span>
              <span>180° (South)</span>
              <span>359°</span>
            </div>
          </div>
        )}

        {/* Calibration Guide */}
        <div className="text-[11px] text-slate-500 flex items-center justify-center gap-1">
          <RotateCw size={12} />
          <span>For best accuracy, wave your device in a figure-8 motion away from magnets.</span>
        </div>
      </div>
    </div>
  );
}
