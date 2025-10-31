import TaxFeeSettings from '@repo/lib/models/admin/TaxFeeSettings';
import AdminOfferModel from '@repo/lib/models/admin/AdminOffers';
import CRMOfferModel from '@repo/lib/models/Vendor/CRMOffer.model';

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
    // If no tax fee settings provided, get the latest settings
    if (!taxFeeSettings && TaxFeeSettings && typeof TaxFeeSettings.getLatestSettings === 'function') {
      taxFeeSettings = await TaxFeeSettings.getLatestSettings();
    }
    
    // If still no tax fee settings, use defaults
    if (!taxFeeSettings) {
      taxFeeSettings = {
        platformFee: 0,
        platformFeeType: 'percentage',
        platformFeeEnabled: false,
        serviceTax: 0,
        serviceTaxType: 'percentage',
        serviceTaxEnabled: false
      };
    }
    
    // Calculate subtotal using discounted price if available, otherwise regular price
    const subtotal = services.reduce((sum, service) => {
      // Use discounted price if available, otherwise regular price
      const price = service.discountedPrice !== null && service.discountedPrice !== undefined ? 
        parseFloat(service.discountedPrice) : 
        parseFloat(service.price || 0);
      return sum + price;
    }, 0);
    
    // Calculate discount amount from offer
    let discountAmount = 0;
    // Handle both raw offer data and offer objects with methods
    if (offer && (offer.type && offer.value)) {
      // Handle direct offer properties (raw data from API)
      if (offer.type === 'percentage') {
        discountAmount = (subtotal * offer.value) / 100;
      } else if (offer.type === 'fixed') {
        discountAmount = Math.min(offer.value, subtotal); // Can't discount more than subtotal
      }
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
    
    // Calculate amount after discount
    const amountAfterDiscount = subtotal - discountAmount;
    
    // Calculate platform fee
    let platformFee = 0;
    if (taxFeeSettings && taxFeeSettings.platformFeeEnabled) {
      if (taxFeeSettings.platformFeeType === 'percentage') {
        platformFee = (amountAfterDiscount * taxFeeSettings.platformFee) / 100;
      } else {
        platformFee = taxFeeSettings.platformFee;
      }
    }
    
    // Calculate amount after platform fee
    const amountAfterPlatformFee = amountAfterDiscount + platformFee;
    
    // Calculate service tax (this is the admin-level service tax)
    let serviceTax = 0;
    if (taxFeeSettings && taxFeeSettings.serviceTaxEnabled) {
      if (taxFeeSettings.serviceTaxType === 'percentage') {
        serviceTax = (amountAfterPlatformFee * taxFeeSettings.serviceTax) / 100;
      } else {
        serviceTax = taxFeeSettings.serviceTax;
      }
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
    
    // Total tax is the sum of admin service tax and vendor service taxes
    const totalTax = serviceTax + vendorServiceTaxTotal;
    
    // Calculate final total
    const finalTotal = amountAfterPlatformFee + totalTax;
    
    return {
      subtotal: parseFloat(subtotal.toFixed(2)),
      discountAmount: parseFloat(discountAmount.toFixed(2)),
      amountAfterDiscount: parseFloat(amountAfterDiscount.toFixed(2)),
      platformFee: parseFloat(platformFee.toFixed(2)),
      amountAfterPlatformFee: parseFloat(amountAfterPlatformFee.toFixed(2)),
      serviceTax: parseFloat(serviceTax.toFixed(2)), // Admin service tax
      vendorServiceTax: parseFloat(vendorServiceTaxTotal.toFixed(2)), // Vendor service taxes
      totalTax: parseFloat(totalTax.toFixed(2)), // Total of all taxes
      finalTotal: parseFloat(finalTotal.toFixed(2)),
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
      subtotal: parseFloat(subtotal.toFixed(2)),
      discountAmount: 0,
      amountAfterDiscount: parseFloat(subtotal.toFixed(2)),
      platformFee: 0,
      amountAfterPlatformFee: parseFloat(subtotal.toFixed(2)),
      serviceTax: 0,
      vendorServiceTax: 0,
      totalTax: 0,
      finalTotal: parseFloat(subtotal.toFixed(2)),
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