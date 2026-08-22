export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { startFundScheduler } = await import("./lib/fund-scheduler");
    startFundScheduler();
  }
}
