/**
 * Tadaruk Astronomical Prayer Calculation Engine
 * Implemented from first principles using spherical trigonometry,
 * solar declination, and the equation of time without external libraries.
 */

// Math helpers with degree inputs/outputs
const rad = (deg) => (deg * Math.PI) / 180.0;
const deg = (rad) => (rad * 180.0) / Math.PI;

const fixAngle = (a) => {
  let res = a - 360.0 * Math.floor(a / 360.0);
  return res < 0 ? res + 360.0 : res;
};

const fixHour = (h) => {
  let res = h - 24.0 * Math.floor(h / 24.0);
  return res < 0 ? res + 24.0 : res;
};

export const CalculationMethods = {
  KARACHI: {
    id: 'KARACHI',
    name: 'University of Islamic Sciences, Karachi',
    fajrAngle: 18.0,
    ishaAngle: 18.0,
    ishaMinutes: null,
  },
  MWL: {
    id: 'MWL',
    name: 'Muslim World League (MWL)',
    fajrAngle: 18.0,
    ishaAngle: 17.0,
    ishaMinutes: null,
  },
  ISNA: {
    id: 'ISNA',
    name: 'Islamic Society of North America (ISNA)',
    fajrAngle: 15.0,
    ishaAngle: 15.0,
    ishaMinutes: null,
  },
  EGYPT: {
    id: 'EGYPT',
    name: 'Egyptian General Authority of Survey',
    fajrAngle: 19.5,
    ishaAngle: 17.5,
    ishaMinutes: null,
  },
  UMM_AL_QURA: {
    id: 'UMM_AL_QURA',
    name: 'Umm al-Qura University, Makkah',
    fajrAngle: 18.5,
    ishaAngle: null,
    ishaMinutes: 90, // 90 min after Maghrib
  },
  CUSTOM: {
    id: 'CUSTOM',
    name: 'Custom Angles',
    fajrAngle: 18.0,
    ishaAngle: 18.0,
    ishaMinutes: null,
  },
};

export const AsrSchools = {
  HANAFI: { id: 'HANAFI', name: 'Hanafi (2x shadow)', factor: 2 },
  STANDARD: { id: 'STANDARD', name: "Shafi'i, Maliki, Hanbali (1x shadow)", factor: 1 },
};

export const HighLatitudeRules = {
  NONE: { id: 'NONE', name: 'None (Exact astronomical)' },
  MIDDLE_OF_NIGHT: { id: 'MIDDLE_OF_NIGHT', name: 'Middle of the Night (Max 1/2 of night)' },
  ONE_SEVENTH: { id: 'ONE_SEVENTH', name: 'One-Seventh of the Night' },
  ANGLE_BASED: { id: 'ANGLE_BASED', name: 'Angle-Based Proportional' },
};

/**
 * Computes Julian Day from a Gregorian Date
 */
export function getJulianDay(year, month, day) {
  if (month <= 2) {
    year -= 1;
    month += 12;
  }
  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);
  return (
    Math.floor(365.25 * (year + 4716)) +
    Math.floor(30.6001 * (month + 1)) +
    day +
    B -
    1524.5
  );
}

/**
 * Computes Solar Coordinates (declination and equation of time)
 */
export function getSolarCoordinates(julianDay) {
  const d = julianDay - 2451545.0; // days since J2000.0
  const g = fixAngle(357.529 + 0.98560028 * d); // Mean anomaly
  const q = fixAngle(280.459 + 0.98564736 * d); // Mean longitude
  const L = fixAngle(q + 1.915 * Math.sin(rad(g)) + 0.02 * Math.sin(rad(2 * g))); // Ecliptic longitude

  // Obliquity of ecliptic
  const e = 23.439 - 0.00000036 * d;

  // Declination (delta)
  const sinDelta = Math.sin(rad(e)) * Math.sin(rad(L));
  const delta = deg(Math.asin(sinDelta));

  // Right ascension (alpha)
  let alpha = deg(Math.atan2(Math.cos(rad(e)) * Math.sin(rad(L)), Math.cos(rad(L)))) / 15.0;
  alpha = fixHour(alpha);

  // Equation of Time (EqT) in hours
  const eqT = q / 15.0 - alpha;

  return {
    declination: delta,
    equationOfTime: eqT,
  };
}

/**
 * Calculates Hour Angle for a given solar altitude angle
 */
function getHourAngle(angle, latitude, declination) {
  const latR = rad(latitude);
  const decR = rad(declination);
  const angR = rad(angle);

  const cosH = (Math.sin(angR) - Math.sin(latR) * Math.sin(decR)) / (Math.cos(latR) * Math.cos(decR));

  if (cosH > 1.0) return NaN; // Sun never reaches angle (polar night)
  if (cosH < -1.0) return NaN; // Sun always above angle (midnight sun)

  return deg(Math.acos(cosH)) / 15.0; // in hours
}

/**
 * Calculate Asr Hour Angle based on shadow multiplier factor (1 for Shafi'i, 2 for Hanafi)
 */
function getAsrHourAngle(factor, latitude, declination) {
  const latR = rad(latitude);
  const decR = rad(declination);
  const diff = Math.abs(latR - decR);
  const cotA = factor + Math.tan(diff);
  const angle = deg(Math.atan(1.0 / cotA)); // Sun altitude above horizon

  return getHourAngle(angle, latitude, declination);
}

/**
 * Main Prayer Calculation Function
 */
export function calculatePrayerTimes(date, location, options = {}) {
  const {
    method = CalculationMethods.KARACHI,
    asrSchool = AsrSchools.HANAFI,
    highLatitudeRule = HighLatitudeRules.ANGLE_BASED,
    altitude = 10, // meters
    customFajrAngle = null,
    customIshaAngle = null,
  } = options;

  const lat = location.latitude;
  const lng = location.longitude;
  const timezone = -date.getTimezoneOffset() / 60.0;

  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const jd = getJulianDay(year, month, day);
  const solar = getSolarCoordinates(jd);

  // Solar noon (Dhuhr) in local hours
  const noon = fixHour(12.0 + timezone - lng / 15.0 - solar.equationOfTime);

  // Sunrise/Sunset astronomical refraction angle + elevation adjustment
  // Standard sun radius + atmospheric refraction = 0.833 deg
  // Additional elevation dip = 0.0347 * sqrt(altitude)
  const elevDip = 0.0347 * Math.sqrt(Math.max(0, altitude));
  const sunriseAngle = -(0.833 + elevDip);

  const sunriseHA = getHourAngle(sunriseAngle, lat, solar.declination) || 6.0;
  const sunrise = fixHour(noon - sunriseHA);
  const sunset = fixHour(noon + sunriseHA);

  // Asr
  const asrHA = getAsrHourAngle(asrSchool.factor, lat, solar.declination) || 3.0;
  const asr = fixHour(noon + asrHA);

  // Fajr Angle
  const fajrDeg = customFajrAngle !== null ? customFajrAngle : method.fajrAngle || 18.0;
  let fajrHA = getHourAngle(-fajrDeg, lat, solar.declination);

  // Isha Angle or Minutes
  const ishaDeg = customIshaAngle !== null ? customIshaAngle : method.ishaAngle;
  let ishaHA = ishaDeg ? getHourAngle(-ishaDeg, lat, solar.declination) : null;

  // Night duration in hours (sunset to sunrise next morning)
  const nightDuration = 24.0 - sunset + sunrise;

  // High latitude adjustments if necessary
  if (isNaN(fajrHA) || highLatitudeRule.id !== 'NONE') {
    let maxFajrPortion;
    if (highLatitudeRule.id === 'MIDDLE_OF_NIGHT') {
      maxFajrPortion = nightDuration / 2.0;
    } else if (highLatitudeRule.id === 'ONE_SEVENTH') {
      maxFajrPortion = nightDuration / 7.0;
    } else {
      // Angle-based
      maxFajrPortion = (nightDuration * fajrDeg) / 60.0;
    }

    if (isNaN(fajrHA) || sunriseHA + fajrHA > nightDuration) {
      fajrHA = maxFajrPortion;
    }
  }

  let fajr = fixHour(noon - (fajrHA || 4.5));

  let isha;
  if (method.ishaMinutes) {
    isha = fixHour(sunset + method.ishaMinutes / 60.0);
  } else {
    if (isNaN(ishaHA) || highLatitudeRule.id !== 'NONE') {
      let maxIshaPortion;
      if (highLatitudeRule.id === 'MIDDLE_OF_NIGHT') {
        maxIshaPortion = nightDuration / 2.0;
      } else if (highLatitudeRule.id === 'ONE_SEVENTH') {
        maxIshaPortion = nightDuration / 7.0;
      } else {
        maxIshaPortion = (nightDuration * (ishaDeg || 17.0)) / 60.0;
      }

      if (isNaN(ishaHA) || sunset + ishaHA > 24 + sunrise) {
        ishaHA = maxIshaPortion;
      }
    }
    isha = fixHour(noon + (ishaHA || 4.5));
  }

  // Maghrib is sunset (plus standard slight safe buffer ~1 min)
  const maghrib = sunset;

  // Tahajjud: Best time is the last third of the night
  // Night starts at Maghrib and ends at Fajr next morning
  const lastThirdStart = fixHour(sunset + (nightDuration * 2) / 3);

  // Duha (Ishraq / Chast): ~15-20 min after sunrise until ~15 min before Dhuhr
  const duha = fixHour(sunrise + 20 / 60.0);

  const toDate = (hours) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const ms = Math.round(hours * 3600 * 1000);
    return new Date(d.getTime() + ms);
  };

  return {
    fajr: toDate(fajr),
    sunrise: toDate(sunrise),
    duha: toDate(duha),
    dhuhr: toDate(noon),
    asr: toDate(asr),
    maghrib: toDate(maghrib),
    isha: toDate(isha),
    tahajjud: toDate(lastThirdStart),
    fajrNext: new Date(toDate(fajr).getTime() + 24 * 3600 * 1000),
    rawHours: {
      fajr,
      sunrise,
      duha,
      dhuhr: noon,
      asr,
      maghrib,
      isha,
      tahajjud: lastThirdStart,
    },
  };
}

/**
 * Format a Date object into 12-hour AM/PM string
 */
export function formatTime(date, includeSeconds = false) {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) return '--:--';
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 becomes 12
  const mStr = minutes < 10 ? '0' + minutes : minutes;
  if (includeSeconds) {
    const s = date.getSeconds();
    const sStr = s < 10 ? '0' + s : s;
    return `${hours}:${mStr}:${sStr} ${ampm}`;
  }
  return `${hours}:${mStr} ${ampm}`;
}

/**
 * Hijri Calendar Calculation
 * Using Kuwaiti / Astronomical Julian Day algorithm
 */
export function getHijriDate(date = new Date(), adjustmentDays = 0) {
  const d = new Date(date);
  d.setDate(d.getDate() + adjustmentDays);

  const day = d.getDate();
  const month = d.getMonth();
  const year = d.getFullYear();

  let m = month + 1;
  let y = year;
  if (m < 3) {
    y -= 1;
    m += 12;
  }

  let a = Math.floor(y / 100);
  let b = 2 - a + Math.floor(a / 4);
  if (y < 1583) b = 0;
  if (y === 1582) {
    if (m > 10) b = -10;
    if (m === 10) {
      b = 0;
      if (day > 4) b = -10;
    }
  }

  const jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524;

  let z = jd - 1948440 + 10632;
  let n = Math.floor((z - 1) / 10631);
  z = z - 10631 * n + 354;
  let j =
    Math.floor((10985 - z) / 5316) * Math.floor((50 * z) / 17719) +
    Math.floor(z / 5670) * Math.floor((43 * z) / 15238);
  z =
    z -
    Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
    Math.floor(j / 16) * Math.floor((15238 * j) / 43) +
    29;
  let hm = Math.floor((24 * z) / 709);
  let hd = z - Math.floor((709 * hm) / 24);
  let hy = 30 * n + j - 30;

  const hijriMonthNamesEn = [
    'Muharram',
    'Safar',
    "Rabi' al-Awwal",
    "Rabi' al-Thani",
    'Jumada al-Ula',
    'Jumada al-Akhirah',
    'Rajab',
    "Sha'ban",
    'Ramadan',
    'Shawwal',
    "Dhu al-Qi'dah",
    'Dhu al-Hijjah',
  ];

  const hijriMonthNamesAr = [
    'محرم',
    'صفر',
    'ربيع الأول',
    'ربيع الثاني',
    'جمادى الأولى',
    'جمادى الآخرة',
    'رجب',
    'شعبان',
    'رمضان',
    'شوال',
    'ذو القعدة',
    'ذو الحجة',
  ];

  const hijriMonthNamesBn = [
    'মুহররম',
    'সফর',
    'রবিউল আউয়াল',
    'রবিউস সানি',
    'জমাদিউল আউয়াল',
    'জমাদিউস সানি',
    'রজব',
    'শাবান',
    'রমজান',
    'শাওয়াল',
    'জিলকদ',
    'জিলহজ',
  ];

  return {
    day: hd,
    month: hm,
    monthName: hijriMonthNamesEn[hm - 1] || '',
    monthNameAr: hijriMonthNamesAr[hm - 1] || '',
    monthNameBn: hijriMonthNamesBn[hm - 1] || '',
    year: hy,
    formatted: `${hd} ${hijriMonthNamesEn[hm - 1]} ${hy} AH`,
    formattedAr: `${hd} ${hijriMonthNamesAr[hm - 1]} ${hy} هـ`,
    formattedBn: `${hd} ${hijriMonthNamesBn[hm - 1]}, ${hy} হিজরি`,
  };
}

/**
 * Significant Islamic Events Calendar with relative countdowns
 */
export function getUpcomingIslamicEvents(currentDate = new Date()) {
  const hijri = getHijriDate(currentDate);

  // Key events defined by Hijri Month (1-12) and Day
  const events = [
    { id: 'ashura', name: 'Ashura (10th Muharram)', nameBn: 'পবিত্র আশুরা', month: 1, day: 10, virtue: 'Fasting expiates sins of the previous year.' },
    { id: 'shaban_mid', name: "Laylat al-Bara'ah (15th Sha'ban)", nameBn: 'শবে বরাত', month: 8, day: 15, virtue: 'Night of forgiveness and divine decree.' },
    { id: 'ramadan_start', name: 'Ramadan Begins', nameBn: 'পবিত্র মাহে রমজান শুরু', month: 9, day: 1, virtue: 'The blessed month of fasting, Qur’an, and immense reward.' },
    { id: 'laylatul_qadr_window', name: 'Last 10 Nights of Ramadan', nameBn: 'রমজানের শেষ দশ রাত (কদর)', month: 9, day: 21, virtue: 'Seek Laylat al-Qadr, a night better than a thousand months.' },
    { id: 'eid_ul_fitr', name: 'Eid al-Fitr', nameBn: 'ঈদুল ফিতর', month: 10, day: 1, virtue: 'Day of celebration and gratitude upon completing Ramadan.' },
    { id: 'arafah', name: 'Day of Arafah', nameBn: 'আরাফাহর দিন', month: 12, day: 9, virtue: 'Fasting expiates sins of previous and coming years for non-pilgrims.' },
    { id: 'eid_ul_adha', name: 'Eid al-Adha', nameBn: 'ঈদুল আজহা', month: 12, day: 10, virtue: 'Festival of sacrifice commemorating Prophet Ibrahim (AS).' },
  ];

  return events.map((ev) => {
    // Estimate days remaining based on 354-day lunar year
    const currentMonth = hijri.month;
    const currentDay = hijri.day;

    let monthDiff = ev.month - currentMonth;
    let dayDiff = ev.day - currentDay;

    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      monthDiff += 12;
    }

    const approxDays = Math.round(monthDiff * 29.53 + dayDiff);
    return {
      ...ev,
      approxDays: Math.max(0, approxDays),
      hijriDateStr: `${ev.day} ${getHijriMonthName(ev.month)}`,
    };
  }).sort((a, b) => a.approxDays - b.approxDays);
}

function getHijriMonthName(m) {
  const names = [
    'Muharram', 'Safar', "Rabi' al-Awwal", "Rabi' al-Thani",
    'Jumada al-Ula', 'Jumada al-Akhirah', 'Rajab', "Sha'ban",
    'Ramadan', 'Shawwal', "Dhu al-Qi'dah", "Dhu al-Hijjah"
  ];
  return names[m - 1] || '';
}

/**
 * Calculates Great Circle Bearing to the Kaaba in Makkah (21.4225° N, 39.8262° E)
 */
export function calculateQiblaBearing(lat, lng) {
  const kaabaLat = rad(21.422524);
  const kaabaLng = rad(39.826182);

  const phi1 = rad(lat);
  const lambda1 = rad(lng);

  const y = Math.sin(kaabaLng - lambda1);
  const x =
    Math.cos(phi1) * Math.tan(kaabaLat) -
    Math.sin(phi1) * Math.cos(kaabaLng - lambda1);

  let qibla = deg(Math.atan2(y, x));
  return (qibla + 360.0) % 360.0;
}

/**
 * Returns the currently active prayer window
 */
export function getActivePrayerWindow(prayerTimes, now = new Date()) {
  if (!prayerTimes) return null;
  const nowMs = now.getTime();

  if (nowMs >= prayerTimes.fajr.getTime() && nowMs < prayerTimes.sunrise.getTime()) {
    return { key: 'fajr', nameEn: 'Fajr', nameAr: 'الفجر', nameBn: 'ফজর' };
  }
  if (nowMs >= prayerTimes.dhuhr.getTime() && nowMs < prayerTimes.asr.getTime()) {
    return { key: 'dhuhr', nameEn: 'Dhuhr', nameAr: 'الظهر', nameBn: 'যোহর' };
  }
  if (nowMs >= prayerTimes.asr.getTime() && nowMs < prayerTimes.maghrib.getTime()) {
    return { key: 'asr', nameEn: 'Asr', nameAr: 'العصر', nameBn: 'আসর' };
  }
  if (nowMs >= prayerTimes.maghrib.getTime() && nowMs < prayerTimes.isha.getTime()) {
    return { key: 'maghrib', nameEn: 'Maghrib', nameAr: 'المغرب', nameBn: 'মাগরিব' };
  }
  if (nowMs >= prayerTimes.isha.getTime() && nowMs < prayerTimes.fajrNext.getTime()) {
    return { key: 'isha', nameEn: 'Isha', nameAr: 'العشاء', nameBn: 'ইশা' };
  }
  return null;
}

/**
 * Returns the next upcoming prayer
 */
export function getNextPrayer(prayerTimes, now = new Date()) {
  if (!prayerTimes) return null;
  const nowMs = now.getTime();

  const sequence = [
    { key: 'fajr', nameEn: 'Fajr', nameAr: 'الفجر', nameBn: 'ফজর', time: prayerTimes.fajr },
    { key: 'sunrise', nameEn: 'Sunrise', nameAr: 'الشروق', nameBn: 'সূর্যোদয়', time: prayerTimes.sunrise },
    { key: 'dhuhr', nameEn: 'Dhuhr', nameAr: 'الظهر', nameBn: 'যোহর', time: prayerTimes.dhuhr },
    { key: 'asr', nameEn: 'Asr', nameAr: 'العصر', nameBn: 'আসর', time: prayerTimes.asr },
    { key: 'maghrib', nameEn: 'Maghrib', nameAr: 'المغرب', nameBn: 'মাগরিব', time: prayerTimes.maghrib },
    { key: 'isha', nameEn: 'Isha', nameAr: 'العشاء', nameBn: 'ইশা', time: prayerTimes.isha },
    { key: 'fajrNext', nameEn: 'Fajr (Tomorrow)', nameAr: 'الفجر', nameBn: 'ফজর', time: prayerTimes.fajrNext },
  ];

  for (const item of sequence) {
    if (item.time.getTime() > nowMs) {
      return item;
    }
  }

  return sequence[0];
}

