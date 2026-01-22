import TaxFeeSettings from '@repo/lib/models/admin/TaxFeeSettings.model.js';
import AdminOfferModel from '@repo/lib/models/admin/AdminOffers.model.js';
import CRMOfferModel from '@repo/lib/models/Vendor/CRMOffer.model.js';

// Add a function to fetch tax fee settings from the public API endpoint
async function fetchTaxFeeSettings() {
  try {
    // Only attempt to fetch in browser environment
    if (typeof window !== 'undefined') {
      const response = await fetch('/api/tax-fees');
      if (response.ok) {
        const settings = await response.json();
        return settings;
      }
    }
    return null;
  } catch (error) {
    console.error('Error fetching tax fee settings:', error);
    return null;
  }
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
      // First try to get from the Mongoose model (server-side)
      if (TaxFeeSettings && typeof TaxFeeSettings.getLatestSettings === 'function') {
        taxFeeSettings = await TaxFeeSettings.getLatestSettings();
      }

      // If that didn't work, try to fetch from public API (browser-side)
      if (!taxFeeSettings) {
        taxFeeSettings = await fetchTaxFeeSettings();
      }
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
      // GST is calculated on the subtotal and platform fee
      const amountForGST = subtotal + platformFee;
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

/**
 * Calculate price for a single service with tax
 * @param {Object} service - Service object
 * @returns {Number} - Price with tax
 */
export function calculateServicePriceWithTax(service) {
  if (service.calculatePriceWithTax) {
    return service.calculatePriceWithTax();
  }

  // Use discounted price if available, otherwise regular price
  const price = service.discountedPrice !== null && service.discountedPrice !== undefined ?
    parseFloat(service.discountedPrice) :
    parseFloat(service.price || 0);

  // Check if service has its own tax configuration
  if (service.tax && service.tax.enabled) {
    if (service.tax.type === "percentage") {
      return price + (price * service.tax.value) / 100;
    } else {
      return price + (service.tax.value || 0);
    }
  }

  // No tax applicable
  return price;
}

/**
 * Validate an offer code and return the offer object if valid
 * @param {string} offerCode - The offer code to validate
 * @param {Array} services - The services being booked
 * @param {string} vendorId - The vendor ID
 * @returns {Object|null} - Valid offer object or null if invalid
 */
export async function validateOfferCode(offerCode, services = [], vendorId = null) {
  if (!offerCode) return null;

  try {
    // Check if models are available (server-side only)
    if (!AdminOfferModel || !CRMOfferModel) {
      console.warn('Offer models not available in browser environment');
      return null;
    }

    // First, check for admin-level offers
    let offer = await AdminOfferModel.findOne({
      code: offerCode.toUpperCase().trim()
    }).lean();

    if (offer) {
      // Convert to Mongoose document-like object with methods
      const offerDoc = new AdminOfferModel(offer);
      if (offerDoc.isApplicable && offerDoc.isApplicable()) {
        return offerDoc;
      }
    }

    // If no valid admin offer found, check for vendor-specific offers
    if (vendorId) {
      offer = await CRMOfferModel.findOne({
        code: offerCode.toUpperCase().trim(),
        businessType: 'vendor',
        businessId: vendorId
      }).lean();

      if (offer) {
        // Convert to Mongoose document-like object with methods
        const offerDoc = new CRMOfferModel(offer);
        // For vendor offers, we need to check if it's applicable to the services
        if (offerDoc.isApplicable && typeof offerDoc.isApplicable === 'function') {
          if (offerDoc.isApplicable(services, [])) { // Pass services for validation
            return offerDoc;
          }
        } else {
          // Fallback to basic validation
          const tempOffer = new CRMOfferModel(offer);
          if (tempOffer.isApplicable && tempOffer.isApplicable()) {
            return tempOffer;
          }
        }
      }
    }

    return null;
  } catch (error) {
    console.error('Error validating offer code:', error);
    return null;
  }
}

export default {
  calculateBookingAmount,
  calculateServicePriceWithTax,
  validateOfferCode
};