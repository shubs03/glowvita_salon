import { useAppSelector } from '@repo/store/hooks';
import { selectCrmAuth } from '@repo/store/slices/crmAuthSlice';

export function useSubscriptionCheck() {
    const { user } = useAppSelector(selectCrmAuth);

    if (!user || !user.subscription) {
        // Assume NOT expired while loading or if data is missing to prevent UI flashes
        return {
            isExpired: false,
            daysRemaining: 0,
            willExpireSoon: false,
            hasScheduledPlan: false,
            subscription: null
        };
    }

    const { subscription } = user;
    const now = new Date();
    const endDate = subscription.endDate ? new Date(subscription.endDate) : null;
    const status = (subscription.status || '').toLowerCase().trim();

    // Check if status is explicitly active
    const isStatusActive = status === 'active';

    // Check if status is explicitly expired/inactive
    const expiredStatuses = ['expired', 'expaired', 'inactive', 'suspended', 'cancelled', 'canceled'];
    const isStatusExpired = expiredStatuses.includes(status);

    // Check if the subscription end date has passed
    const isDateExpired = endDate ? endDate.getTime() <= now.getTime() : false;

    // Check if there's a Scheduled plan waiting to activate in the history
    // A scheduled plan has an endDate in the future but startDate in the future too
    const history = subscription.history || [];
    const hasScheduledPlan = history.some((h) => {
        const hStatus = (h.status || '').toLowerCase().trim();
        const hEndDate = h.endDate ? new Date(h.endDate) : null;
        return hStatus === 'scheduled' && hEndDate && hEndDate.getTime() > now.getTime();
    }) || (status === 'scheduled');

    // A subscription is expired if:
    // 1. Status is in the expired list OR end date has passed
    // AND 2. There is NO scheduled plan waiting to activate
    const isExpired = (isStatusExpired || isDateExpired) && !hasScheduledPlan;

    // Calculate days remaining (only if not already expired)
    let daysRemaining = 0;
    if (endDate && !isExpired) {
        const timeDiff = endDate.getTime() - now.getTime();
        daysRemaining = Math.max(0, Math.ceil(timeDiff / (1000 * 3600 * 24)));
    }

    // Will expire soon (within 7 days)
    const willExpireSoon = !isExpired && daysRemaining > 0 && daysRemaining <= 7;

    return {
        isExpired,
        daysRemaining,
        willExpireSoon,
        hasScheduledPlan,
        subscription
    };
}
