import { useAppSelector } from '@repo/store/hooks';
import { selectCrmAuth } from '@repo/store/slices/crmAuthSlice';

export function useSubscriptionCheck() {
    const { user } = useAppSelector(selectCrmAuth);

    if (!user || !user.subscription) {
        return {
            isExpired: true,
            daysRemaining: 0,
            willExpireSoon: false,
            subscription: null
        };
    }

    const { subscription } = user;
    const now = new Date();
    const endDate = subscription.endDate ? new Date(subscription.endDate) : null;

    // Check if subscription is expired
    const isStatusExpired = subscription.status?.toLowerCase() === 'expired';
    const isDateExpired = endDate ? endDate <= now : true;
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
