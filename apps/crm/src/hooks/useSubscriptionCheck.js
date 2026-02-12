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
            subscription: null
        };
    }

    const { subscription } = user;
    const now = new Date();
    // Reset hours to compare dates only if needed, but for now exact time is better for expiration
    const endDate = subscription.endDate ? new Date(subscription.endDate) : null;
    const status = (subscription.status || '').toLowerCase().trim();

    // Check if status is explicitly active
    const isStatusActive = status === 'active';

    // Check if status is explicitly expired/inactive
    const expiredStatuses = ['expired', 'expaired', 'inactive', 'suspended', 'cancelled', 'canceled'];
    const isStatusExpired = expiredStatuses.includes(status);

    // Check if the subscription end date has passed
    const isDateExpired = endDate ? endDate.getTime() <= now.getTime() : false;

    // A subscription is expired if:
    // 1. Status is in the expired list
    // OR 
    // 2. The end date has passed (regardless of status, since server might not have updated yet)
    const isExpired = isStatusExpired || isDateExpired;

    // Calculate days remaining (only if not already expired)
    let daysRemaining = 0;
    if (endDate && !isExpired) {
        const timeDiff = endDate.getTime() - now.getTime();
        daysRemaining = Math.max(0, Math.ceil(timeDiff / (1000 * 3600 * 24)));
    }

    // Will expire soon (within 7 days)
    const willExpireSoon = !isExpired && daysRemaining > 0 && daysRemaining <= 7;

    console.log('Subscription Check:', {
        status,
        isStatusActive,
        isStatusExpired,
        isDateExpired,
        isExpired,
        daysRemaining,
        willExpireSoon,
        endDate: endDate?.toISOString(),
        now: now.toISOString(),
    });

    return {
        isExpired,
        daysRemaining,
        willExpireSoon,
        subscription
    };
}
