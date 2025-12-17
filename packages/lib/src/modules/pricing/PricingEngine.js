/**
 * Pricing Engine Module
 * Handles price calculation with base price, location surcharge, travel fee, and surge pricing
 */

class PricingEngine {
  /**
   * Calculate total price for a service
   * @param {Object} service - Service object with pricing information
   * @param {Object} vendor - Vendor object with pricing rules
   * @param {Object} customerLocation - Customer location {lat, lng} (optional)
   * @param {boolean} isWeddingService - Whether this is a wedding service
   * @param {Date} date - Service date (for surge pricing)
   * @returns {Promise<Object>} - Price breakdown
   */
  static async calculatePrice(service, vendor, customerLocation = null, isWeddingService = false, date = null) {
    try {
      // Base price
      let basePrice = service.price;
      if (service.discountedPrice !== null && service.discountedPrice !== undefined) {
        basePrice = service.discountedPrice;
      }
      
      // Location surcharge
      let locationSurcharge = 0;
      if (customerLocation && vendor.location) {
        // Calculate distance-based surcharge
        locationSurcharge = this.calculateLocationSurcharge(vendor.location, customerLocation);
      }
      
      // Travel fee
      let travelFee = 0;
      if (customerLocation && vendor.vendorType !== 'shop-only') {
        travelFee = await this.calculateTravelFee(vendor, customerLocation);
      }
      
      // Surge pricing for wedding services or peak times
      let surgeMultiplier = 1;
      if (isWeddingService) {
        surgeMultiplier = 1.2; // 20% surge for wedding services
      } else if (date) {
        surgeMultiplier = this.calculateSurgeMultiplier(date);
      }
      
      // Apply surge pricing
      const priceWithSurge = (basePrice + locationSurcharge + travelFee) * surgeMultiplier;
      
      // Calculate tax
      let taxAmount = 0;
      if (service.tax && service.tax.enabled) {
        if (service.tax.type === 'percentage') {
          taxAmount = (priceWithSurge * service.tax.value) / 100;
        } else {
          taxAmount = service.tax.value;
        }
      }
      
      // Final total
      const finalTotal = priceWithSurge + taxAmount;
      
      return {
        basePrice,
        locationSurcharge,
        travelFee,
        surgeMultiplier,
        priceWithSurge: priceWithSurge - taxAmount, // Price before tax
        taxAmount,
        finalTotal,
        breakdown: {
          base: basePrice,
          location: locationSurcharge,
          travel: travelFee,
          surge: surgeMultiplier,
          tax: taxAmount,
          total: finalTotal
        }
      };
    } catch (error) {
      console.error('Error calculating price:', error);
      throw error;
    }
  }
  
  /**
   * Calculate location surcharge based on distance
   * @param {Object} vendorLocation - Vendor location {lat, lng}
   * @param {Object} customerLocation - Customer location {lat, lng}
   * @returns {number} - Location surcharge
   */
  static calculateLocationSurcharge(vendorLocation, customerLocation) {
    // Calculate distance using Haversine formula
    const distance = this.calculateHaversineDistance(vendorLocation, customerLocation);
    
    // Simple distance-based surcharge
    // $5 for every 5km beyond 10km
    if (distance <= 10) {
      return 0; // No surcharge within 10km
    }
    
    const surcharge = Math.ceil((distance - 10) / 5) * 5;
    return Math.min(surcharge, 50); // Cap at $50
  }
  
  /**
   * Calculate travel fee
   * @param {Object} vendor - Vendor object
   * @param {Object} customerLocation - Customer location {lat, lng}
   * @returns {Promise<number>} - Travel fee
   */
  static async calculateTravelFee(vendor, customerLocation) {
    // For now, we'll use a simple distance-based fee
    // In a production environment, this could be more sophisticated
    
    try {
      // Import travel utilities (using dynamic import to avoid circular dependencies)
      const { calculateHaversineDistance } = await import('../scheduling/EnhancedTravelUtils.js');
      
      const distance = calculateHaversineDistance(vendor.baseLocation || vendor.location, customerLocation);
      
      // Check if customer is within travel radius
      if (distance > vendor.travelRadius) {
        throw new Error('Customer location is outside vendor travel radius');
      }
      
      // Simple fee structure:
      // - $10 base fee
      // - $2 per km beyond 5km
      if (distance <= 5) {
        return 10; // Base fee only
      }
      
      const additionalFee = (distance - 5) * 2;
      return 10 + additionalFee;
    } catch (error) {
      console.error('Error calculating travel fee:', error);
      throw error;
    }
  }
  
  /**
   * Calculate Haversine distance between two points
   * @param {Object} origin - Origin coordinates {lat, lng}
   * @param {Object} destination - Destination coordinates {lat, lng}
   * @returns {number} - Distance in kilometers
   */
  static calculateHaversineDistance(origin, destination) {
    const R = 6371; // Earth radius in kilometers
    
    const dLat = this.deg2rad(destination.lat - origin.lat);
    const dLon = this.deg2rad(destination.lng - origin.lng);
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(origin.lat)) * Math.cos(this.deg2rad(destination.lat)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
      
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in kilometers
  }
  
  /**
   * Convert degrees to radians
   * @param {number} deg - Degrees
   * @returns {number} - Radians
   */
  static deg2rad(deg) {
    return deg * (Math.PI/180);
  }
  
  /**
   * Calculate surge multiplier based on date/time
   * @param {Date} date - Service date
   * @returns {number} - Surge multiplier
   */
  static calculateSurgeMultiplier(date) {
    // Simple surge pricing logic:
    // - 1.5x on weekends
    // - 1.3x on evenings (after 6PM)
    // - 1.2x on holidays (simplified)
    
    const dayOfWeek = date.getDay();
    const hour = date.getHours();
    
    // Weekend surge
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return 1.5;
    }
    
    // Evening surge
    if (hour >= 18) {
      return 1.3;
    }
    
    // Holiday surge (simplified - just December)
    if (date.getMonth() === 11) {
      return 1.2;
    }
    
    return 1; // No surge
  }
  
  /**
   * Apply promo code discount
   * @param {number} price - Original price
   * @param {Object} promoCode - Promo code object
   * @returns {number} - Discounted price
   */
  static applyPromoCode(price, promoCode) {
    if (!promoCode || !promoCode.isActive) {
      return price;
    }
    
    if (promoCode.discountType === 'percentage') {
      const discount = (price * promoCode.discountValue) / 100;
      return Math.max(0, price - discount);
    } else if (promoCode.discountType === 'fixed') {
      return Math.max(0, price - promoCode.discountValue);
    }
    
    return price;
  }
}

export default PricingEngine;