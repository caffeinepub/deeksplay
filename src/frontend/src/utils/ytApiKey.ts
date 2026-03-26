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
  return -1; // All exhausted
}

export function getActiveApiKey(): string {
  const idx = getCurrentKeyIndex();
  return idx >= 0 ? API_KEYS[idx] : API_KEYS[0];
}

export function markKeyExhausted(keyIndex: number): string | null {
  const data = getExhaustedData();
  if (!data.exhausted.includes(keyIndex)) {
    data.exhausted.push(keyIndex);
    saveExhaustedData(data);
  }
  // Find next non-exhausted key
  for (let i = 0; i < API_KEYS.length; i++) {
    if (!data.exhausted.includes(i)) return API_KEYS[i];
  }
  return null; // All keys exhausted
}

// Keep old export name for compatibility
export function markCurrentKeyExhausted(): string | null {
  const currentIndex = getCurrentKeyIndex();
  if (currentIndex < 0) return null;
  return markKeyExhausted(currentIndex);
}

export function isQuotaExhaustedError(
  status: number,
  // biome-ignore lint/suspicious/noExplicitAny: YouTube API response
  data: any,
): boolean {
  // Direct HTTP 403 with quota reason
  if (status === 403) {
    if (!data?.error) return true; // Treat any 403 as quota issue
    const msg = (data.error.message || "").toLowerCase();
    const reason = data.error.errors?.[0]?.reason || "";
    // If 403 and any of these reasons, it's quota
    if (
      msg.includes("quota") ||
      msg.includes("exceeded") ||
      msg.includes("rate") ||
      reason === "quotaExceeded" ||
      reason === "dailyLimitExceeded" ||
      reason === "rateLimitExceeded" ||
      reason === "forbidden" ||
      data.error.code === 403
    ) {
      return true;
    }
  }
  // Also check for quota errors in 200 responses (unusual but safe)
  if (data?.error) {
    const msg = (data.error.message || "").toLowerCase();
    const reason = data.error.errors?.[0]?.reason || "";
    return (
      msg.includes("quota") ||
      msg.includes("exceeded") ||
      reason === "quotaExceeded" ||
      reason === "dailyLimitExceeded" ||
      reason === "rateLimitExceeded"
    );
  }
  return false;
}

export function getKeyStatus(): {
  index: number;
  total: number;
  exhaustedCount: number;
  allExhausted: boolean;
  keys: Array<{ label: string; active: boolean; exhausted: boolean }>;
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
    })),
  };
}
