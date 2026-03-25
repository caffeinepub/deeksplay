// YouTube API Key Rotation System
// 3 keys from 3 different Google Cloud Projects = 30,000 units/day total
// Automatically switches to next key when current one is exhausted

const API_KEYS = [
  "AIzaSyDySA-v4ObH1L6k7ZSRlxEd61H594H0cSI", // Project 1
  "AIzaSyDMNE2qLnyKs_lu_om4gGpwLOIXPNpDbsk", // Project 2
  "AIzaSyDKN0uNpJcwW8fgwOB8y9jErZ8qjEZXp0U", // Project 3
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
  // Find first non-exhausted key
  for (let i = 0; i < API_KEYS.length; i++) {
    if (!exhausted.exhausted.includes(i)) return i;
  }
  return 0; // All exhausted, return first (will show quota error)
}

export function getActiveApiKey(): string {
  return API_KEYS[getCurrentKeyIndex()];
}

export function markCurrentKeyExhausted(): string | null {
  const currentIndex = getCurrentKeyIndex();
  const data = getExhaustedData();
  if (!data.exhausted.includes(currentIndex)) {
    data.exhausted.push(currentIndex);
    saveExhaustedData(data);
  }
  // Return next available key index
  const nextIndex = getCurrentKeyIndex();
  if (nextIndex === currentIndex && data.exhausted.length >= API_KEYS.length) {
    return null; // All keys exhausted
  }
  return API_KEYS[nextIndex];
}

export function isQuotaExhaustedError(data: {
  error?: { message?: string; errors?: Array<{ reason?: string }> };
}): boolean {
  if (!data.error) return false;
  const msg = data.error.message?.toLowerCase() || "";
  const reason = data.error.errors?.[0]?.reason || "";
  return (
    msg.includes("quota") ||
    msg.includes("exceeded") ||
    reason === "quotaExceeded" ||
    reason === "dailyLimitExceeded"
  );
}

export function getKeyStatus(): {
  index: number;
  total: number;
  exhaustedCount: number;
  allExhausted: boolean;
} {
  const data = getExhaustedData();
  const currentIndex = getCurrentKeyIndex();
  return {
    index: currentIndex + 1,
    total: API_KEYS.length,
    exhaustedCount: data.exhausted.length,
    allExhausted: data.exhausted.length >= API_KEYS.length,
  };
}
