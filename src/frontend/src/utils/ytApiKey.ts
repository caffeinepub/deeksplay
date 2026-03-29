// YouTube API Key Rotation System
// 3 keys from 3 different Google Cloud Projects = 30,000 units/day total
// Automatically switches to next key when current one is exhausted

const API_KEYS = [
  "AIzaSyD7hpK6wim2btzsNni9uwXgupfhh-RjSRk", // Project 1 (New)
  "AIzaSyD1iZ0hlaYbJUFA0lt4uDED3vkBdBIiLC8", // Project 2 (New)
  "AIzaSyDgwHsJpJo-TJeQhXg4zKctOByr656S6xU", // Project 3 (New)
];

const KEY_EXHAUSTED_KEY = "deeksplay_key_exhausted";
const RESET_HOUR_UTC = 19; // 7pm UTC = 12:30 AM IST

function getTodayUTC(): string {
  const now = new Date();
  if (now.getUTCHours() < RESET_HOUR_UTC) {
    return now.toISOString().slice(0, 10);
  }
  const tomorrow = new Date(now);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  return tomorrow.toISOString().slice(0, 10);
}

interface ExhaustedData {
  exhausted: number[]; // indices of exhausted keys
  date: string;
  reasons?: Record<number, string>; // reason per key index
}

function getExhaustedData(): ExhaustedData {
  try {
    const raw = localStorage.getItem(KEY_EXHAUSTED_KEY);
    if (!raw) return { exhausted: [], date: getTodayUTC() };
    const data = JSON.parse(raw) as ExhaustedData;
    if (data.date !== getTodayUTC()) {
      // New day -- reset all keys
      return { exhausted: [], date: getTodayUTC() };
    }
    return data;
  } catch {
    return { exhausted: [], date: getTodayUTC() };
  }
}

function saveExhaustedData(data: ExhaustedData): void {
  try {
    localStorage.setItem(KEY_EXHAUSTED_KEY, JSON.stringify(data));
  } catch {}
}

export function getCurrentKeyIndex(): number {
  const exhausted = getExhaustedData();
  for (let i = 0; i < API_KEYS.length; i++) {
    if (!exhausted.exhausted.includes(i)) return i;
  }
  return -1; // All exhausted
}

export function getActiveApiKey(): string {
  const idx = getCurrentKeyIndex();
  return idx >= 0 ? API_KEYS[idx] : API_KEYS[0];
}

export function markKeyExhausted(
  keyIndex: number,
  reason?: string,
): string | null {
  const data = getExhaustedData();
  if (!data.exhausted.includes(keyIndex)) {
    data.exhausted.push(keyIndex);
    if (reason) {
      data.reasons = data.reasons || {};
      data.reasons[keyIndex] = reason;
    }
    saveExhaustedData(data);
  }
  for (let i = 0; i < API_KEYS.length; i++) {
    if (!data.exhausted.includes(i)) return API_KEYS[i];
  }
  return null;
}

export function markCurrentKeyExhausted(): string | null {
  const currentIndex = getCurrentKeyIndex();
  if (currentIndex < 0) return null;
  return markKeyExhausted(currentIndex);
}

// Manual reset -- clears all exhausted state
export function resetAllKeys(): void {
  try {
    localStorage.removeItem(KEY_EXHAUSTED_KEY);
  } catch {}
}

// IMPORTANT: Only rotate on GENUINE quota exhaustion errors.
// Do NOT rotate on keyInvalid / accessNotConfigured -- those are setup issues.
// biome-ignore lint/suspicious/noExplicitAny: YouTube API response
export function isQuotaExhaustedError(status: number, data: any): boolean {
  if (data?.error) {
    const reason = (data.error.errors?.[0]?.reason || "").toLowerCase();
    const msg = (data.error.message || "").toLowerCase();

    // Key configuration problems -- DON'T rotate, these are setup issues
    const setupErrors = [
      "keyinvalid",
      "accessnotconfigured",
      "apikeynotvalid",
      "forbidden",
      "insufficient",
      "badrequest",
    ];
    if (setupErrors.some((e) => reason.includes(e) || msg.includes(e))) {
      return false;
    }

    // Genuine quota / rate limit errors -- rotate!
    const quotaErrors = [
      "quotaexceeded",
      "ratelimitexceeded",
      "dailylimitexceeded",
      "usagelimits",
      "quota",
      "rate limit",
    ];
    if (quotaErrors.some((e) => reason.includes(e) || msg.includes(e))) {
      return true;
    }

    // 403 with unknown error body -- rotate as a precaution
    if (status === 403) return true;
  }

  // 403 without parseable body -- rotate
  if (status === 403) return true;

  return false;
}

export function getKeyStatus(): {
  index: number;
  total: number;
  exhaustedCount: number;
  allExhausted: boolean;
  keys: Array<{
    label: string;
    active: boolean;
    exhausted: boolean;
    reason?: string;
  }>;
} {
  const data = getExhaustedData();
  const currentIndex = getCurrentKeyIndex();
  return {
    index: currentIndex >= 0 ? currentIndex + 1 : API_KEYS.length,
    total: API_KEYS.length,
    exhaustedCount: data.exhausted.length,
    allExhausted: data.exhausted.length >= API_KEYS.length,
    keys: API_KEYS.map((_, i) => ({
      label: `Key ${i + 1}`,
      active: i === currentIndex,
      exhausted: data.exhausted.includes(i),
      reason: data.reasons?.[i],
    })),
  };
}
