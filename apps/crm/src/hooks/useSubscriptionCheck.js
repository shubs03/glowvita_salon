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
    const endDate = subscription.endDate ? new Date(subscription.endDate) : null;
    const status = (subscription.status || '').toLowerCase().trim();

    // If status is explicitly "active", check only the end date
    const isStatusActive = status === 'active';

    // Check if subscription status indicates it's not active
    const expiredStatuses = ['expired', 'expaired', 'inactive', 'suspended', 'cancelled', 'canceled'];
    const isStatusExpired = expiredStatuses.includes(status);

    // Check if the subscription end date has passed
    const isDateExpired = endDate ? endDate <= now : false;

    console.log('Subscription Check:', {
        status,
        isStatusActive,
        isStatusExpired,
        isDateExpired,
        endDate: endDate?.toISOString(),
        now: now.toISOString(),
    });

    // If status is active AND date hasn't expired, subscription is valid
    if (isStatusActive && !isDateExpired) {
        return {
            isExpired: false,
            daysRemaining: endDate ? Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 3600 * 24)) : 0,
            willExpireSoon: endDate ? Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 3600 * 24)) <= 7 : false,
            subscription
        };
    }

    // If status is in expired list OR date has passed, subscription is expired
    const isExpired = isStatusExpired || isDateExpired;

    // Calculate days remaining
    let daysRemaining = 0;
    if (endDate && !isExpired) {
        const timeDiff = endDate.getTime() - now.getTime();
        daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));
    }

    // Will expire soon (within 7 days)
    const willExpireSoon = !isExpired && daysRemaining > 0 && daysRemaining <= 7;

    return {
        isExpired,
        daysRemaining,
        willExpireSoon,
        subscription
    };
}
