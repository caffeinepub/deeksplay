// Module-level quota tracker for YouTube API units
// Daily quota = 10,000 units per key, resets at 7pm UTC (12:30 AM IST next day)
// 3 keys = 30,000 total units/day

import { useEffect, useState } from "react";
import { getCurrentKeyIndex, getKeyStatus } from "../utils/ytApiKey";

const TOTAL_PER_KEY = 10000;
const TOTAL_ALL_KEYS = 30000;
const RESET_HOUR_UTC = 19; // 7pm UTC

function getQuotaKey(index: number): string {
  return `deeksplay_quota_${index}`;
}

interface QuotaData {
  used: number;
  resetDate: string;
}

function getResetCycleDate(): string {
  const now = new Date();
  if (now.getUTCHours() < RESET_HOUR_UTC) {
    return now.toISOString().slice(0, 10);
  }
  const tomorrow = new Date(now);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  return tomorrow.toISOString().slice(0, 10);
}

function readQuotaForKey(index: number): QuotaData {
  try {
    const raw = localStorage.getItem(getQuotaKey(index));
    if (!raw) return { used: 0, resetDate: getResetCycleDate() };
    const data = JSON.parse(raw) as QuotaData;
    if (data.resetDate !== getResetCycleDate()) {
      return { used: 0, resetDate: getResetCycleDate() };
    }
    return data;
  } catch {
    return { used: 0, resetDate: getResetCycleDate() };
  }
}

function writeQuotaForKey(index: number, data: QuotaData): void {
  try {
    localStorage.setItem(getQuotaKey(index), JSON.stringify(data));
  } catch {}
}

const QUOTA_EVENT = "deeksplay_quota_change";

// Exported module-level function (NOT a hook) — can be called anywhere
export function deductUnits(n: number): void {
  const index = getCurrentKeyIndex();
  const current = readQuotaForKey(index);
  const updated: QuotaData = {
    used: Math.min(current.used + n, TOTAL_PER_KEY),
    resetDate: current.resetDate,
  };
  writeQuotaForKey(index, updated);
  window.dispatchEvent(new Event(QUOTA_EVENT));
}

function getMsUntilReset(): number {
  const now = new Date();
  const resetDate = getResetCycleDate();
  const reset = new Date(
    `${resetDate}T${String(RESET_HOUR_UTC).padStart(2, "0")}:00:00Z`,
  );
  return Math.max(0, reset.getTime() - now.getTime());
}

export function useApiQuota() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    function refresh() {
      setTick((t) => t + 1);
    }
    window.addEventListener(QUOTA_EVENT, refresh);
    window.addEventListener("storage", refresh);
    const interval = setInterval(refresh, 60_000);
    return () => {
      window.removeEventListener(QUOTA_EVENT, refresh);
      window.removeEventListener("storage", refresh);
      clearInterval(interval);
    };
  }, []);

  // Recompute on each tick
  const currentIndex = getCurrentKeyIndex();
  const currentQuota = readQuotaForKey(currentIndex);
  const usedUnits = currentQuota.used;
  const remainingUnits = TOTAL_PER_KEY - usedUnits;

  // Sum remaining across all 3 keys
  let totalRemainingUnits = 0;
  for (let i = 0; i < 3; i++) {
    const q = readQuotaForKey(i);
    totalRemainingUnits += TOTAL_PER_KEY - q.used;
  }

  const keyStatus = getKeyStatus();
  const msUntilReset = getMsUntilReset();

  // Suppress unused tick warning
  void tick;

  return {
    usedUnits,
    remainingUnits,
    totalUnits: TOTAL_PER_KEY,
    totalAllUnits: TOTAL_ALL_KEYS,
    totalRemainingUnits,
    keyStatus,
    deductUnits,
    resetTimeIST: "12:30 AM IST",
    msUntilReset,
  };
}
