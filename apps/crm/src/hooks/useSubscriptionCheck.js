import { useState, useEffect, useMemo } from 'react';
import { useAppSelector } from '@repo/store/hooks';
import { selectCrmAuth } from '@repo/store/slices/crmAuthSlice';

const getTime = (dateString) => {
    if (!dateString) return 0;
    const date = new Date(dateString);
    return Number.isNaN(date.getTime()) ? 0 : date.getTime();
};

export function useSubscriptionCheck() {
    const { user } = useAppSelector(selectCrmAuth);
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const result = useMemo(() => {
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
        const nowTime = now.getTime();

        const entries = [
            ...(subscription.history || []),
            {
                plan: subscription.plan,
                startDate: subscription.startDate,
                endDate: subscription.endDate,
                status: subscription.status,
            },
        ];

        // Deduplicate entries
        const uniqueEntries = entries.filter((entry, index, allEntries) => {
            const planId = typeof entry.plan === 'object' ? (entry.plan?._id || entry.plan?.$oid) : entry.plan;
            const key = `${planId}-${entry.startDate}-${entry.endDate}`;
            return allEntries.findIndex(item => {
                const itemPlanId = typeof item.plan === 'object' ? (item.plan?._id || item.plan?.$oid) : item.plan;
                const itemKey = `${itemPlanId}-${item.startDate}-${item.endDate}`;
                return itemKey === key;
            }) === index;
        });

        uniqueEntries.sort((a, b) => getTime(a.startDate) - getTime(b.startDate));

        let hasActivePlan = false;
        let activeEntry = null;
        let scheduledEntry = null;

        const evaluatedEntries = uniqueEntries.map(entry => {
            const startTime = getTime(entry.startDate);
            const endTime = getTime(entry.endDate);
            let displayStatus = "Expired";

            if (endTime > nowTime) {
                if (!hasActivePlan && startTime <= nowTime) {
                    displayStatus = "Active";
                    hasActivePlan = true;
                    activeEntry = entry;
                } else {
                    displayStatus = "Scheduled";
                    if (!scheduledEntry) scheduledEntry = entry;
                }
            }

            return { ...entry, displayStatus };
        });

        const isExpired = !hasActivePlan;
        const hasScheduledPlan = !!scheduledEntry;

        // Calculate days remaining based on the active plan (or next scheduled plan if none active)
        const visiblePlan = activeEntry || scheduledEntry;
        let daysRemaining = 0;
        
        if (visiblePlan && visiblePlan.endDate) {
            const timeDiff = getTime(visiblePlan.endDate) - nowTime;
            daysRemaining = Math.max(0, Math.ceil(timeDiff / (1000 * 3600 * 24)));
        }

        // Will expire soon (within 7 days) if there's an active plan but no scheduled plan to take over
        const willExpireSoon = hasActivePlan && !hasScheduledPlan && daysRemaining > 0 && daysRemaining <= 7;

        return {
            isExpired,
            daysRemaining,
            willExpireSoon,
            hasScheduledPlan,
            subscription,
            activeEntry,
            scheduledEntry
        };
    }, [user, now]);

    return result;
}
