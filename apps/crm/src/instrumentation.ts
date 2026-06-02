export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Only run the cron jobs in the Node.js runtime environment, not the Edge runtime
    console.log('[Instrumentation] Starting background scheduled jobs...');
    const { startScheduledJobs } = await import('@repo/lib/modules/scheduling/scheduledJobs');
    
    // Connect to the database if not already connected
    // This ensures the cron job has DB access since instrumentation runs very early
    const _db = (await import('@repo/lib/db')).default;
    await _db();

    // Start the cron tasks
    startScheduledJobs();
  }
}
