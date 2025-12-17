     import React, { useState, useEffect } from 'react';
import { useBooking } from './useBooking';

/**
 * Example component demonstrating booking system integration
 */
const BookingExample = () => {
  const {
    // State
    vendors,
    services,
    staff,
    slots,
    selectedVendor,
    selectedServices,
    selectedStaff,
    selectedSlot,
    travelTimeInfo,
    quote,
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
  } = useBooking();

  const [step, setStep] = useState(1);
  const [customerLocation, setCustomerLocation] = useState({ lat: null, lng: null });
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [lockToken, setLockToken] = useState(null);

  // Example: Get user location
  useEffect(() => {
    // In a real app, you would use the Geolocation API or a location service
    // navigator.geolocation.getCurrentPosition((position) => {
    //   setCustomerLocation({
    //     lat: position.coords.latitude,
    //     lng: position.coords.longitude
    //   });
    // });
    
    // For demo purposes, we'll use a fixed location
    setCustomerLocation({
      lat: 12.9716,
      lng: 77.5946
    });
  }, []);

  // Step 1: Search for vendors
  const handleSearchVendors = async () => {
    try {
      await searchVendors({
        lat: customerLocation.lat,
        lng: customerLocation.lng,
        radius: 20,
        category: 'unisex'
      });
      setStep(2);
    } catch (err) {
      console.error('Failed to search vendors:', err);
    }
  };

  // Step 2: Select a vendor and load their services
  const handleSelectVendor = async (vendor) => {
    selectVendor(vendor);
    try {
      await loadVendorServices(vendor.id);
      await loadVendorStaff(vendor.id);
      setStep(3);
    } catch (err) {
      console.error('Failed to load vendor data:', err);
    }
  };

  // Step 3: Select services and find available slots
  const handleSelectServices = async (selectedServices) => {
    selectServices(selectedServices);
    
    try {
      const serviceIds = selectedServices.map(s => s.id);
      await searchSlots({
        vendorId: selectedVendor.id,
        serviceIds,
        date: bookingDate,
        lat: customerLocation.lat,
        lng: customerLocation.lng,
        isHomeService: true
      });
      setStep(4);
    } catch (err) {
      console.error('Failed to search slots:', err);
    }
  };

  // Step 4: Select a time slot and generate quote
  const handleSelectSlot = async (slot) => {
    selectSlot(slot);
    
    try {
      const quoteResult = await generateQuote({
        vendorId: selectedVendor.id,
        serviceIds: selectedServices.map(s => s.id),
        date: bookingDate,
        customerLocation,
        isHomeService: true
      });
      
      // Calculate travel time
      if (customerLocation.lat && customerLocation.lng) {
        await calculateTravelTime(selectedVendor.id, customerLocation);
      }
      
      setStep(5);
    } catch (err) {
      console.error('Failed to generate quote:', err);
    }
  };

  // Step 5: Lock the slot
  const handleLockSlot = async () => {
    try {
      const lockResult = await lockSlot({
        vendorId: selectedVendor.id,
        serviceId: selectedServices[0]?.id,
        serviceName: selectedServices[0]?.name,
        date: bookingDate,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        clientId: 'demo-client-id',
        clientName: 'Demo Client',
        isHomeService: true,
        location: customerLocation,
        duration: selectedSlot.duration,
        amount: selectedServices.reduce((sum, s) => sum + s.price, 0),
        totalAmount: selectedServices.reduce((sum, s) => sum + s.price, 0),
        finalAmount: selectedServices.reduce((sum, s) => sum + s.price, 0)
      });
      
      setLockToken(lockResult.lockId);
      setStep(6);
    } catch (err) {
      console.error('Failed to lock slot:', err);
    }
  };

  // Step 6: Confirm booking
  const handleConfirmBooking = async () => {
    try {
      const confirmationResult = await confirmBooking({
        appointmentId: 'demo-appointment-id', // This would come from the lock response
        lockId: lockToken,
        paymentDetails: {
          method: 'Pay at Salon',
          status: 'pending'
        }
      });
      
      console.log('Booking confirmed:', confirmationResult);
      setStep(7);
    } catch (err) {
      console.error('Failed to confirm booking:', err);
    }
  };

  if (loading) {
    return <div className="booking-container">Loading...</div>;
  }

  if (error) {
    return (
      <div className="booking-container">
        <div className="error-message">Error: {error}</div>
        <button onClick={() => setError(null)}>Retry</button>
      </div>
    );
  }

  return (
    <div className="booking-container">
      <h2>Booking Demo</h2>
      
      {/* Step 1: Vendor Search */}
      {step === 1 && (
        <div className="step">
          <h3>Step 1: Find Vendors</h3>
          <button onClick={handleSearchVendors}>Search Nearby Vendors</button>
        </div>
      )}
      
      {/* Step 2: Vendor Selection */}
      {step === 2 && (
        <div className="step">
          <h3>Step 2: Select a Vendor</h3>
          <div className="vendor-list">
            {vendors.map(vendor => (
              <div key={vendor.id} className="vendor-card" onClick={() => handleSelectVendor(vendor)}>
                <h4>{vendor.businessName}</h4>
                <p>{vendor.description}</p>
                {vendor.location && (
                  <p>Distance: {(vendor.location.lat - customerLocation.lat).toFixed(2)}km</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Step 3: Service Selection */}
      {step === 3 && selectedVendor && (
        <div className="step">
          <h3>Step 3: Select Services</h3>
          <h4>Selected Vendor: {selectedVendor.businessName}</h4>
          <div className="service-list">
            {services.map(service => (
              <div key={service.id} className="service-item">
                <h5>{service.name}</h5>
                <p>Price: ₹{service.price}</p>
                <p>Duration: {service.duration} mins</p>
                <button onClick={() => handleSelectServices([service])}>
                  Select Service
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Step 4: Slot Selection */}
      {step === 4 && selectedServices.length > 0 && (
        <div className="step">
          <h3>Step 4: Select Time Slot</h3>
          <h4>Selected Services: {selectedServices.map(s => s.name).join(', ')}</h4>
          {travelTimeInfo && (
            <div className="travel-info">
              <p>Estimated Travel Time: {travelTimeInfo.timeInMinutes} minutes</p>
              <p>Distance: {travelTimeInfo.distanceInKm} km</p>
            </div>
          )}
          <div className="slot-list">
            {slots.map((slot, index) => (
              <div key={index} className="slot-item" onClick={() => handleSelectSlot(slot)}>
                <p>{slot.startTime} - {slot.endTime}</p>
                <p>Duration: {slot.duration} mins</p>
                {slot.travelTime > 0 && (
                  <p>Travel Time: {slot.travelTime} mins</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Step 5: Quote and Lock */}
      {step === 5 && selectedSlot && (
        <div className="step">
          <h3>Step 5: Review & Lock</h3>
          {quote && (
            <div className="quote-summary">
              <h4>Quote Summary</h4>
              <p>Total Price: ₹{quote.totalPrice}</p>
              <p>Total Duration: {quote.totalDuration} mins</p>
            </div>
          )}
          <button onClick={handleLockSlot}>Lock This Time Slot</button>
        </div>
      )}
      
      {/* Step 6: Confirm Booking */}
      {step === 6 && lockToken && (
        <div className="step">
          <h3>Step 6: Confirm Booking</h3>
          <p>Your slot is locked! Please confirm to complete your booking.</p>
          <button onClick={handleConfirmBooking}>Confirm Booking</button>
        </div>
      )}
      
      {/* Step 7: Booking Confirmed */}
      {step === 7 && (
        <div className="step">
          <h3>Booking Confirmed!</h3>
          <p>Thank you for your booking.</p>
          <button onClick={resetBooking}>Book Another Service</button>
        </div>
      )}
    </div>
  );
};

export default BookingExample;