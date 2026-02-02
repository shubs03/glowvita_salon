import { useState, useEffect, useMemo } from 'react';
import { calculateBookingAmount } from '@repo/lib/utils/paymentCalculator';

interface Service {
    id: string;
    price: number | string;
    discountedPrice?: number | string | null;
    selectedAddons?: Array<{
        _id: string;
        name: string;
        price: number;
        duration?: number;
    }>;
}

interface PriceBreakdown {
    subtotal: number;
    discountAmount: number;
    amountAfterDiscount: number;
    platformFee: number;
    serviceTax: number;
    vendorServiceTax: number;
    totalTax: number;
    finalTotal: number;
    taxFeeSettings: any;
}

/**
 * Hook to calculate price breakdown including platform fees and taxes
 * @param services - Array of selected services
 * @param taxFeeSettings - Tax and fee settings from admin
 * @param offer - Optional offer/coupon data
 * @returns Price breakdown with all calculated fees
 */
export function usePriceCalculation(
    services: Service[],
    taxFeeSettings: any = null,
    offer: any = null
): {
    priceBreakdown: PriceBreakdown | null;
    isCalculating: boolean;
    error: Error | null;
} {
    const [priceBreakdown, setPriceBreakdown] = useState<PriceBreakdown | null>(null);
    const [isCalculating, setIsCalculating] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const calculatePrices = async () => {
            if (!services || services.length === 0) {
                setPriceBreakdown(null);
                return;
            }

            setIsCalculating(true);
            setError(null);

            try {
                const breakdown = await calculateBookingAmount(services, offer, taxFeeSettings);
                setPriceBreakdown(breakdown);
            } catch (err) {
                console.error('Error calculating price breakdown:', err);
                setError(err as Error);
                // Set default values on error
                const subtotal = services.reduce((sum, service) => {
                    const price = service.discountedPrice !== null && service.discountedPrice !== undefined
                        ? parseFloat(String(service.discountedPrice))
                        : parseFloat(String(service.price || 0));

                    const addOnsPrice = (service.selectedAddons || []).reduce((acc, addon) => {
                        return acc + parseFloat(String(addon.price || 0));
                    }, 0);

                    return sum + price + addOnsPrice;
                }, 0);

                setPriceBreakdown({
                    subtotal: Math.round(subtotal),
                    discountAmount: 0,
                    amountAfterDiscount: Math.round(subtotal),
                    platformFee: 0,
                    serviceTax: 0,
                    vendorServiceTax: 0,
                    totalTax: 0,
                    finalTotal: Math.round(subtotal),
                    taxFeeSettings: null
                });
            } finally {
                setIsCalculating(false);
            }
        };

        calculatePrices();
    }, [services, taxFeeSettings, offer]);

    return { priceBreakdown, isCalculating, error };
}

export default usePriceCalculation;
