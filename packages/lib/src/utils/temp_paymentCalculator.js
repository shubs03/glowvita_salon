// Standalone version for testing - IMPORTS REMOVED

// Add a function to fetch tax fee settings from the public API endpoint
async function fetchTaxFeeSettings() {
    return null;
}

/**
 * Calculate the final booking amount including platform fees, taxes, and discounts
 * @param {Array} services - Array of service objects with price and tax information
 * @param {Object} offer - Offer object (if applicable)
 * @param {Object} taxFeeSettings - Tax and fee settings from admin panel
 * @returns {Object} - Breakdown of all calculations
 */
export async function calculateBookingAmount(
    services,
    offer = null,
    taxFeeSettings = null
) {
    try {
        // If no tax fee settings provided, try to fetch them
        if (!taxFeeSettings) {
            // SKIPPED FOR TEST
        }

        // If still no tax fee settings, use defaults with fees enabled
        if (!taxFeeSettings) {
            taxFeeSettings = {
                platformFee: 15,
                platformFeeType: 'percentage',
                platformFeeEnabled: true,
                serviceTax: 18,
                serviceTaxType: 'percentage',
                serviceTaxEnabled: true
            };
        }

        // Calculate subtotal using discounted price if available, otherwise regular price
        const subtotal = services.reduce((sum, service) => {
            // Use discounted price if available, otherwise regular price
            const price = service.discountedPrice !== null && service.discountedPrice !== undefined ?
                parseFloat(service.discountedPrice) :
                parseFloat(service.price || 0);

            // Add price of selected add-ons
            const addOnsPrice = (service.selectedAddons || []).reduce((acc, addon) => {
                return acc + parseFloat(addon.price || 0);
            }, 0);

            return sum + price + addOnsPrice;
        }, 0);

        // Calculate discount amount from offer (applied only to subtotal, not to platform fees or taxes)
        let discountAmount = 0;
        // Handle both raw offer data and offer objects with methods
        if (offer && (offer.type && offer.value)) {
            // Handle direct offer properties (raw data from API)
            console.log('Applying offer to subtotal:', { offer, subtotal });
            if (offer.type === 'percentage') {
                discountAmount = (subtotal * offer.value) / 100;
            } else if (offer.type === 'fixed') {
                discountAmount = Math.min(offer.value, subtotal); // Can't discount more than subtotal
            }
            console.log('Calculated discount amount:', discountAmount);
        } else if (offer && typeof offer.isApplicable === 'function' && offer.isApplicable()) {
            // Use the offer's calculateDiscount method if available (for Mongoose objects)
            if (typeof offer.calculateDiscount === 'function') {
                discountAmount = offer.calculateDiscount(subtotal);
            } else if (offer.type && offer.value) {
                // Handle direct offer properties
                if (offer.type === 'percentage') {
                    discountAmount = (subtotal * offer.value) / 100;
                } else if (offer.type === 'fixed') {
                    discountAmount = Math.min(offer.value, subtotal); // Can't discount more than subtotal
                }
            }
        }

        // Calculate platform fee (calculated on subtotal - user wants discount applied last)
        let platformFee = 0;
        if (taxFeeSettings && taxFeeSettings.platformFeeEnabled) {
            if (taxFeeSettings.platformFeeType === 'percentage') {
                platformFee = (subtotal * taxFeeSettings.platformFee) / 100;
            } else {
                platformFee = taxFeeSettings.platformFee;
            }
            console.log('Calculated platform fee:', platformFee);
        }

        // Calculate GST (calculated on subtotal + platform fee)
        let serviceTax = 0; // This is GST
        if (taxFeeSettings && taxFeeSettings.serviceTaxEnabled) {
            // GST is calculated on the subtotal only as per user request
            const amountForGST = subtotal;
            if (taxFeeSettings.serviceTaxType === 'percentage') {
                serviceTax = (amountForGST * taxFeeSettings.serviceTax) / 100;
            } else {
                serviceTax = taxFeeSettings.serviceTax;
            }
            console.log('Calculated GST:', serviceTax);
        }

        // Calculate vendor-specific taxes for each service
        let vendorServiceTaxTotal = 0;
        for (const service of services) {
            if (service.tax && service.tax.enabled) {
                if (service.tax.type === 'percentage') {
                    const servicePrice = service.discountedPrice !== null && service.discountedPrice !== undefined ?
                        parseFloat(service.discountedPrice) :
                        parseFloat(service.price || 0);
                    vendorServiceTaxTotal += (servicePrice * service.tax.value) / 100;
                } else {
                    vendorServiceTaxTotal += service.tax.value || 0;
                }
            }
        }
        console.log('Calculated vendor service tax:', vendorServiceTaxTotal);

        // Total tax is the sum of GST and vendor service taxes
        const totalTax = serviceTax + vendorServiceTaxTotal;

        // Calculate amount after discount (for tracking purposes, though finalTotal is calculated differently now)
        const amountAfterDiscount = subtotal - discountAmount;

        // Calculate final total (subtract discount from the sum of everything else)
        const finalTotal = (subtotal + platformFee + totalTax) - discountAmount;

        console.log('Final calculation breakdown:', {
            subtotal,
            discountAmount,
            amountAfterDiscount,
            platformFee,
            serviceTax,
            vendorServiceTaxTotal,
            totalTax,
            finalTotal
        });

        return {
            subtotal: Math.round(subtotal),
            discountAmount: Math.round(discountAmount),
            amountAfterDiscount: Math.round(amountAfterDiscount),
            platformFee: Math.round(platformFee),
            serviceTax: Math.round(serviceTax), // This is GST
            vendorServiceTax: Math.round(vendorServiceTaxTotal),
            totalTax: Math.round(totalTax),
            finalTotal: Math.round(finalTotal),
            taxFeeSettings
        };
    } catch (error) {
        console.error('Error calculating booking amount:', error);
        // Return default values if calculation fails
        const subtotal = services.reduce((sum, service) => {
            const price = service.discountedPrice !== null && service.discountedPrice !== undefined ?
                parseFloat(service.discountedPrice) :
                parseFloat(service.price || 0);
            return sum + price;
        }, 0);

        return {
            subtotal: Math.round(subtotal),
            discountAmount: 0,
            amountAfterDiscount: Math.round(subtotal),
            platformFee: 0,
            serviceTax: 0,
            vendorServiceTax: 0,
            totalTax: 0,
            finalTotal: Math.round(subtotal),
            taxFeeSettings: null
        };
    }
}
