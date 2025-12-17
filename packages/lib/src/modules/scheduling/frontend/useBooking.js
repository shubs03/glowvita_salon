import { useState, useCallback } from 'react';
import * as BookingUtils from './BookingUtils';

/**
 * React hook for booking system integration
 * Provides simplified state management and API interactions for booking flows
 */
export function useBooking() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [bookingState, setBookingState] = useState({
    vendors: [],
    services: [],
    staff: [],
    slots: [],
    selectedVendor: null,
    selectedServices: [],
    selectedStaff: null,
    selectedSlot: null,
    travelTimeInfo: null,
    quote: null
  });

  /**
   * Search for available vendors
   */
  const searchVendors = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    try {
      const vendors = await BookingUtils.fetchAvailableVendors(params);
      setBookingState(prev => ({ ...prev, vendors }));
      return vendors;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Load services for a vendor
   */
  const loadVendorServices = useCallback(async (vendorId) => {
    setLoading(true);
    setError(null);
    try {
      const services = await BookingUtils.fetchVendorServices(vendorId);
      setBookingState(prev => ({ ...prev, services }));
      return services;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Load staff for a vendor
   */
  const loadVendorStaff = useCallback(async (vendorId) => {
    setLoading(true);
    setError(null);
    try {
      const staff = await BookingUtils.fetchVendorStaff(vendorId);
      setBookingState(prev => ({ ...prev, staff }));
      return staff;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Search for available slots
   */
  const searchSlots = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    try {
      const slots = await BookingUtils.fetchAvailableSlots(params);
      setBookingState(prev => ({ ...prev, slots }));
      return slots;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Generate a quote
   */
  const generateQuote = useCallback(async (quoteData) => {
    setLoading(true);
    setError(null);
    try {
      const quoteResult = await BookingUtils.generateQuote(quoteData);
      setBookingState(prev => ({ ...prev, quote: quoteResult.quote }));
      return quoteResult;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Lock a time slot
   */
  const lockSlot = useCallback(async (lockData) => {
    setLoading(true);
    setError(null);
    try {
      const lockResult = await BookingUtils.lockTimeSlot(lockData);
      return lockResult;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Confirm a booking
   */
  const confirmBooking = useCallback(async (confirmationData) => {
    setLoading(true);
    setError(null);
    try {
      const confirmationResult = await BookingUtils.confirmBooking(confirmationData);
      return confirmationResult;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Calculate travel time
   */
  const calculateTravelTime = useCallback(async (vendorId, customerLocation) => {
    setLoading(true);
    setError(null);
    try {
      const travelTimeInfo = await BookingUtils.getTravelTime(vendorId, customerLocation);
      setBookingState(prev => ({ ...prev, travelTimeInfo }));
      return travelTimeInfo;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Select a vendor
   */
  const selectVendor = useCallback((vendor) => {
    setBookingState(prev => ({ ...prev, selectedVendor: vendor }));
  }, []);

  /**
   * Select services
   */
  const selectServices = useCallback((services) => {
    setBookingState(prev => ({ ...prev, selectedServices: services }));
  }, []);

  /**
   * Select staff
   */
  const selectStaff = useCallback((staff) => {
    setBookingState(prev => ({ ...prev, selectedStaff: staff }));
  }, []);

  /**
   * Select a time slot
   */
  const selectSlot = useCallback((slot) => {
    setBookingState(prev => ({ ...prev, selectedSlot: slot }));
  }, []);

  /**
   * Reset the booking state
   */
  const resetBooking = useCallback(() => {
    setBookingState({
      vendors: [],
      services: [],
      staff: [],
      slots: [],
      selectedVendor: null,
      selectedServices: [],
      selectedStaff: null,
      selectedSlot: null,
      travelTimeInfo: null,
      quote: null
    });
    setError(null);
  }, []);

  return {
    // State
    ...bookingState,
    loading,
    error,
    
    // Actions
    searchVendors,
    loadVendorServices,
    loadVendorStaff,
    searchSlots,
    generateQuote,
    lockSlot,
    confirmBooking,
    calculateTravelTime,
    selectVendor,
    selectServices,
    selectStaff,
    selectSlot,
    resetBooking
  };
}

export default useBooking;