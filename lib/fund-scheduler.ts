import { getSettings } from "@/lib/settings";
import { runFundActivityCheck } from "@/lib/fund-activity";

const BASE_TICK_MS = 30_000;

const g = globalThis as unknown as {
  __fundSchedulerStarted?: boolean;
  __fundSchedulerLastRun?: number;
  __fundSchedulerRunning?: boolean;
};

export function startFundScheduler() {
  if (g.__fundSchedulerStarted) return;
  g.__fundSchedulerStarted = true;
  g.__fundSchedulerLastRun = 0;
  g.__fundSchedulerRunning = false;
  console.log("[fund-scheduler] started — will poll every interval when enabled");

  const tick = async () => {
    let enabled = false;
    let pollSeconds = 60;
    try {
      const s = getSettings();
      enabled = s.fundActivityEnabled;
      pollSeconds = s.fundActivityPollSeconds ?? 60;
    } catch {
      return;
    }
    if (!enabled) return;
    if (g.__fundSchedulerRunning) return;
    if (Date.now() - (g.__fundSchedulerLastRun || 0) < pollSeconds * 1000) return;

    g.__fundSchedulerRunning = true;
    g.__fundSchedulerLastRun = Date.now();
    try {
      await runFundActivityCheck();
    } catch {
      // ignore — logged inside
    } finally {
      g.__fundSchedulerRunning = false;
    }
  };

  setInterval(tick, BASE_TICK_MS);
}
