const DAY_MS = 24 * 60 * 60 * 1000;

export const SCHEDULED_SUBSCRIPTION_STATUS = 'Scheduled';

export function addDuration(startDate, duration = 1, durationType = 'months') {
  const endDate = new Date(startDate);
  const normalizedType = String(durationType || 'months').toLowerCase();

  switch (normalizedType) {
    case 'days':
      endDate.setDate(endDate.getDate() + duration);
      break;
    case 'weeks':
      endDate.setDate(endDate.getDate() + (duration * 7));
      break;
    case 'months':
      endDate.setMonth(endDate.getMonth() + duration);
      break;
    case 'years':
      endDate.setFullYear(endDate.getFullYear() + duration);
      break;
    default:
      endDate.setDate(endDate.getDate() + duration);
      break;
  }

  return endDate;
}

export function hasActiveSubscription(subscription, now = new Date()) {
  if (!subscription?.plan || !subscription?.endDate) return false;
  return subscription.status === 'Active' && new Date(subscription.endDate).getTime() > now.getTime();
}

function planId(plan) {
  return plan?._id?.toString?.() || plan?.toString?.() || '';
}

function samePeriod(a, b) {
  return planId(a.plan) === planId(b.plan)
    && new Date(a.startDate).getTime() === new Date(b.startDate).getTime()
    && new Date(a.endDate).getTime() === new Date(b.endDate).getTime();
}

function sortedHistory(subscription) {
  return [...(subscription?.history || [])].sort((a, b) => {
    const startDiff = new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    if (startDiff !== 0) return startDiff;
    return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
  });
}

export function getLastQueuedEndDate(subscription, fallbackDate = new Date()) {
  const candidates = [
    subscription?.endDate,
    ...sortedHistory(subscription)
      .filter(entry => ['Active', SCHEDULED_SUBSCRIPTION_STATUS, 'Upcoming'].includes(entry.status))
      .map(entry => entry.endDate),
  ].filter(Boolean);

  if (candidates.length === 0) return new Date(fallbackDate);

  return new Date(Math.max(
    new Date(fallbackDate).getTime(),
    ...candidates.map(date => new Date(date).getTime()).filter(time => !Number.isNaN(time))
  ));
}

export function createSubscriptionEntry(plan, startDate, endDate, status, purchaseDate = new Date()) {
  return {
    plan,
    startDate,
    endDate,
    status,
    purchaseDate,
  };
}

export function queueOrActivateSubscription(user, plan, now = new Date()) {
  if (!user.subscription) {
    user.subscription = { history: [] };
  }

  if (!Array.isArray(user.subscription.history)) {
    user.subscription.history = [];
  }

  reconcileSubscriptionSchedule(user, now);

  if (hasActiveSubscription(user.subscription, now)) {
    const startDate = getLastQueuedEndDate(user.subscription, user.subscription.endDate);
    const endDate = addDuration(startDate, plan.duration || 1, plan.durationType || 'months');
    // Pass `now` as purchaseDate so it records WHEN the user bought the plan, not when it starts
    const scheduledEntry = createSubscriptionEntry(plan._id, startDate, endDate, SCHEDULED_SUBSCRIPTION_STATUS, now);
    user.subscription.history.push(scheduledEntry);
    
    if (typeof user.markModified === 'function') {
      user.markModified('subscription');
    }
    
    return { mode: SCHEDULED_SUBSCRIPTION_STATUS, entry: scheduledEntry };
  }

  const startDate = new Date(now);
  const endDate = addDuration(startDate, plan.duration || 1, plan.durationType || 'months');

  user.subscription.plan = plan._id;
  user.subscription.status = 'Active';
  user.subscription.startDate = startDate;
  user.subscription.endDate = endDate;
  user.subscription.purchaseDate = now; // ← store purchase date

  if (typeof user.markModified === 'function') {
    user.markModified('subscription');
  }

  return {
    mode: 'Active',
    entry: createSubscriptionEntry(plan._id, startDate, endDate, 'Active', now),
  };
}

export function reconcileSubscriptionSchedule(user, now = new Date()) {
  const subscription = user?.subscription;
  if (!subscription?.plan || !subscription?.endDate) return false;

  const nowTime = now.getTime();
  let changed = false;

  if (!Array.isArray(subscription.history)) {
    subscription.history = [];
  }

  // Loop until the main subscription is either valid (Active/Scheduled & not ended) or completely Expired
  while (true) {
    const currentEndTime = new Date(subscription.endDate).getTime();
    
    // If the current plan is valid and hasn't ended, we're good.
    if (['Active', SCHEDULED_SUBSCRIPTION_STATUS].includes(subscription.status) && currentEndTime > nowTime) {
      break; 
    }

    // The current plan has ended (or was incorrectly left pending/active). Mark it as Expired in history.
    if (subscription.status !== 'Expired') {
      const expiredCurrent = createSubscriptionEntry(
        subscription.plan,
        subscription.startDate,
        subscription.endDate,
        'Expired',
        subscription.purchaseDate || subscription.startDate
      );

      const existingCurrent = subscription.history.find(entry => samePeriod(entry, expiredCurrent));
      if (existingCurrent) {
        existingCurrent.status = 'Expired';
      } else {
        subscription.history.push(expiredCurrent);
      }
      changed = true;
    }

    // Find the NEXT plan in history that is Scheduled/Upcoming
    const sorted = sortedHistory(subscription);
    const nextEntryIndex = sorted.findIndex(entry => 
      [SCHEDULED_SUBSCRIPTION_STATUS, 'Upcoming'].includes(entry.status)
    );

    if (nextEntryIndex === -1) {
      // No more scheduled plans
      if (subscription.status !== 'Expired') {
        subscription.status = 'Expired';
        changed = true;
      }
      break;
    }

    const nextEntry = sorted[nextEntryIndex];
    const actualNextEntry = subscription.history.find(e => samePeriod(e, nextEntry));
    
    // Promote it to main subscription
    subscription.plan = nextEntry.plan;
    subscription.startDate = nextEntry.startDate;
    subscription.endDate = nextEntry.endDate;
    
    // Check if this new plan has ALREADY ended (skipped silently)
    if (new Date(nextEntry.endDate).getTime() <= nowTime) {
      subscription.status = 'Expired';
      if (actualNextEntry) actualNextEntry.status = 'Expired';
    } else {
      // Is it active now or in the future?
      const isFuture = new Date(nextEntry.startDate).getTime() > nowTime;
      subscription.status = isFuture ? SCHEDULED_SUBSCRIPTION_STATUS : 'Active';
      if (actualNextEntry) actualNextEntry.status = subscription.status;
    }
    
    changed = true;
  }

  if (changed && typeof user.markModified === 'function') {
    user.markModified('subscription');
  }

  return changed;
}

export function daysBetween(startDate, endDate) {
  return Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / DAY_MS);
}
