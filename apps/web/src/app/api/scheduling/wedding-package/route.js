import { NextResponse } from 'next/server';
import connectDB from '@repo/lib/db';
import WeddingPackageModel from '@repo/lib/models/Vendor/WeddingPackage.model';
import { checkAndCreditReferralBonus } from '@repo/lib/utils/referralWalletCredit';

/**
 * Lock a wedding package slot
 */
export async function POST(request) {
  try {
    console.log("=== WEDDING PACKAGE POST ENDPOINT CALLED ===");
    await connectDB();

    const body = await request.json();
    console.log("Request body:", JSON.stringify(body, null, 2));
    const { packageId, selectedSlot, clientId, clientName, customerDetails } = body;

    if (!packageId || !selectedSlot || !clientId) {
      console.log("Missing required fields:", { packageId: !!packageId, selectedSlot: !!selectedSlot, clientId: !!clientId });
      return NextResponse.json(
        { success: false, message: 'Missing required fields: packageId, selectedSlot, or clientId' },
        { status: 400 }
      );
    }

    console.log("Looking for wedding package with ID:", packageId);

    // First, check if packageId is a valid ObjectId
    const mongoose = await import('mongoose');
    if (!mongoose.default.Types.ObjectId.isValid(packageId)) {
      console.log("Invalid ObjectId format:", packageId);
      return NextResponse.json(
        { success: false, message: 'Invalid package ID format' },
        { status: 400 }
      );
    }

    // Find the wedding package
    const weddingPackage = await WeddingPackageModel.findById(packageId).lean();
    console.log("WeddingPackageModel result:", !!weddingPackage);

    if (!weddingPackage) {
      console.log("Wedding package not found with ID:", packageId);
      return NextResponse.json(
        { success: false, message: 'Wedding package not found' },
        { status: 404 }
      );
    }

    console.log("Found wedding package:", { id: weddingPackage._id, name: weddingPackage.name });

    console.log("Final wedding package found:", !!weddingPackage);

    if (!weddingPackage) {
      console.log("Wedding package not found for ID:", packageId);
      return NextResponse.json(
        { success: false, message: 'Wedding package not found' },
        { status: 404 }
      );
    }

    console.log("Wedding package details:", {
      id: weddingPackage._id,
      name: weddingPackage.name,
      vendorId: weddingPackage.vendorId
    });

    // Only acquire a Redis lock, DO NOT create appointment yet
    console.log("Importing OptimisticLocking module...");
    const { acquireLock } = await import('@repo/lib/modules/scheduling/OptimisticLocking');

    console.log("Acquiring lock for wedding package...");
    console.log("Selected slot data:", {
      date: selectedSlot.date,
      startTime: selectedSlot.startTime,
      endTime: selectedSlot.endTime
    });

    let travelTime = Number(selectedSlot.totalTravelTime) || 0;
    if (selectedSlot.location) {
      try {
        const { calculateVendorTravelTime } = await import('@repo/lib/modules/scheduling/EnhancedTravelUtils');
        const travelInfo = await calculateVendorTravelTime(weddingPackage.vendorId, {
          lat: selectedSlot.location.lat,
          lng: selectedSlot.location.lng
        });
        travelTime = travelInfo.timeInMinutes;
      } catch (err) {
        if (err.message.includes('outside vendor travel radius')) {
          return NextResponse.json(
            { success: false, message: 'We do not reach that point. Select another location.' },
            { status: 400 }
          );
        }
        console.warn("Could not calculate travel time during lock phase:", err.message);
        travelTime = 30; // fallback
      }
    }

    // Acquire lock - this just reserves the slot in Redis
    // CRITICAL: startTime must be provided to create a time-specific lock
    const lockToken = await acquireLock({
      vendorId: weddingPackage.vendorId.toString(),
      staffId: `wedding-${selectedSlot.startTime}`, // Make staffId time-specific to avoid day-wide locks
      date: new Date(selectedSlot.date),
      startTime: selectedSlot.startTime, // Use startTime parameter
      duration: weddingPackage.duration || 60,
      travelTime: travelTime,
      ttl: 30 * 60 * 1000 // 30 minutes
    });

    console.log("Lock acquired:", lockToken);

    // Check if lock was actually acquired
    if (!lockToken) {
      console.log("Failed to acquire lock - slot may be taken");
      return NextResponse.json(
        { success: false, message: 'This time slot is no longer available. Please select another time.' },
        { status: 409 }
      );
    }

    const lockResult = {
      success: true,
      lockId: lockToken,
      packageDetails: {
        id: weddingPackage._id.toString(),
        name: weddingPackage.name,
        vendorId: weddingPackage.vendorId.toString()
      },
      message: 'Slot locked successfully. Complete payment to confirm booking.'
    };

    console.log("=== LOCK RESULT SUCCESS ===", lockResult);
    return NextResponse.json(lockResult);
  } catch (error) {
    console.error('=== ERROR IN POST ENDPOINT ===');
    console.error('Error locking wedding package slot:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Confirm a wedding package booking - creates appointment after payment
 */
export async function PUT(request) {
  try {
    console.log("=== WEDDING PACKAGE PUT ENDPOINT CALLED ===");
    await connectDB();

    const body = await request.json();
    console.log("PUT Request body:", JSON.stringify(body, null, 2));
    const { packageId, lockId, selectedSlot, clientName, customerDetails, paymentDetails, customizedPackageServices } = body;

    if (!packageId || !lockId || !selectedSlot) {
      console.log("Missing required fields:", { packageId: !!packageId, lockId: !!lockId, selectedSlot: !!selectedSlot });
      return NextResponse.json(
        { success: false, message: 'Missing required fields: packageId, lockId, or selectedSlot' },
        { status: 400 }
      );
    }

    console.log("Confirming wedding package booking for package:", packageId);

    // Find the wedding package
    const weddingPackage = await WeddingPackageModel.findById(packageId).lean();
    console.log("WeddingPackageModel result:", !!weddingPackage);

    if (!weddingPackage) {
      return NextResponse.json(
        { success: false, message: 'Wedding package not found' },
        { status: 404 }
      );
    }

    // Now create the appointment with payment confirmation
    const AppointmentModel = (await import('@repo/lib/models/Appointment/Appointment.model')).default;

    console.log("Creating confirmed appointment after payment...");
    console.log("Coupon code from request:", selectedSlot.couponCode);
    console.log("Discount amount from request:", selectedSlot.discountAmount);

    // Check if appointment already exists for this time slot to prevent duplicates
    const startOfDay = new Date(selectedSlot.date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(selectedSlot.date);
    endOfDay.setHours(23, 59, 59, 999);

    const existingAppointment = await AppointmentModel.findOne({
      vendorId: weddingPackage.vendorId,
      date: { $gte: startOfDay, $lte: endOfDay },
      startTime: selectedSlot.startTime,
      endTime: selectedSlot.endTime,
      status: { $in: ['scheduled', 'confirmed', 'checked-in'] },
      isWeddingService: true
    });

    if (existingAppointment) {
      console.log("Appointment already exists for this time slot:", existingAppointment._id);
      return NextResponse.json({
        success: false,
        message: 'This time slot is already booked',
        existingAppointment: existingAppointment._id
      }, { status: 409 });
    }

    // Get first service from package as the primary service, or use package ID
    const primaryServiceId = weddingPackage.services && weddingPackage.services.length > 0
      ? weddingPackage.services[0].serviceId || weddingPackage.services[0]._id
      : weddingPackage._id; // Fallback to package ID if no services

    // Get team members or assigned staff
    const teamMembers = selectedSlot.teamMembers || weddingPackage.assignedStaff || [];
    const primaryStaffName = teamMembers.length > 0
      ? (typeof teamMembers[0] === 'string' ? teamMembers[0] : teamMembers[0].name || teamMembers[0].firstName || 'Wedding Team')
      : 'Wedding Team';

    // Fetch Vendor Region
    const VendorModel = (await import('@repo/lib/models/Vendor/Vendor.model')).default;
    const vendor = await VendorModel.findById(weddingPackage.vendorId).select('regionId').lean();

    // Calculate implicit discount percentage from wedding package if it exists
    let packageDiscountPercentage = 0;
    if (weddingPackage.totalPrice > 0 && weddingPackage.discountedPrice !== null && weddingPackage.discountedPrice < weddingPackage.totalPrice) {
      packageDiscountPercentage = ((weddingPackage.totalPrice - weddingPackage.discountedPrice) / weddingPackage.totalPrice) * 100;
    }

    const isEditablePackage = !!customizedPackageServices && customizedPackageServices.length > 0;

    // We only apply the percentage if we don't already have an explicit discountAmount provided
    const discount = Number(selectedSlot.discount) || packageDiscountPercentage || 0;
    const explicitDiscountAmount = Number(selectedSlot.discountAmount);

    let baseAmount;
    let discountAmount;
    let subtotal;

    if (isEditablePackage) {
      // Editable Packages: calculate from rawServicesTotal
      const rawServicesTotal = customizedPackageServices.reduce((sum, svc) => {
        // Handle nested or flat price properties depending on what's available
        let price = svc.price;
        if (price === undefined && svc.servicePrice !== undefined) price = svc.servicePrice;
        if (price === undefined && svc.amount !== undefined) price = svc.amount;
        return sum + (Number(price) || 0);
      }, 0);

      discountAmount = explicitDiscountAmount > 0
        ? explicitDiscountAmount
        : (discount > 0 ? (rawServicesTotal * discount / 100) : 0);

      subtotal = rawServicesTotal - discountAmount;
      baseAmount = rawServicesTotal; // Keep consistent for finalAmount formula
    } else {
      // Non-Editable Packages: keep current behavior exactly as it is
      baseAmount = Number(selectedSlot.totalAmount) || weddingPackage.totalPrice;

      discountAmount = explicitDiscountAmount > 0
        ? explicitDiscountAmount
        : (discount > 0 ? (baseAmount * discount / 100) : 0);

      subtotal = baseAmount - discountAmount;
    }

    // Extract fee fields from selectedSlot
    const platformFee = Number(selectedSlot.platformFee) || 0;
    const serviceTax = Number(selectedSlot.serviceTax) || 0;
    const taxRate = Number(selectedSlot.taxRate) || 0;

    // finalAmount = subtotal + fees + taxes
    const calculatedFinalAmount = subtotal + platformFee + serviceTax;
    // Prefer our backend calculation if it differs to fix incorrect frontend payloads
    const finalAmount = calculatedFinalAmount;

    // Helper functions for time conversion
    const timeToMinutes = (timeStr) => {
      const [h, m] = timeStr.split(':').map(Number);
      return h * 60 + m;
    };

    const minutesToTime = (totalMin) => {
      const h = Math.floor(totalMin / 60) % 24;
      const m = totalMin % 60;
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    };

    // Calculate/extract travel time and travel metadata
    let travelTime = Number(selectedSlot.totalTravelTime) || 0;
    let travelDistance = Number(selectedSlot.travelDistance) || 0;
    let distanceMeters = Number(selectedSlot.distanceMeters) || 0;

    if (!!selectedSlot.location && (travelTime === 0 || travelDistance === 0)) {
      try {
        const { calculateVendorTravelTime } = await import('@repo/lib/modules/scheduling/EnhancedTravelUtils');
        const travelInfo = await calculateVendorTravelTime(weddingPackage.vendorId, {
          lat: selectedSlot.location.lat,
          lng: selectedSlot.location.lng
        });
        travelTime = travelInfo.timeInMinutes;
        travelDistance = travelInfo.distanceInKm;
        distanceMeters = travelInfo.distanceInMeters;
      } catch (err) {
        if (err.message.includes('outside vendor travel radius')) {
          return NextResponse.json({
            success: false,
            message: "We do not reach that point. Select another location."
          }, { status: 400 });
        }
        console.warn("Could not calculate travel time during confirmation fallback:", err.message);
        travelTime = 30; // fallback
      }
    }

    const blockingWindows = [];
    const blockedTravelWindows = [];

    if (!!selectedSlot.location && travelTime > 0) {
      const startMin = timeToMinutes(selectedSlot.startTime);
      const endMin = timeToMinutes(selectedSlot.endTime);

      const preTravelStart = startMin - travelTime;
      const preTravelEnd = startMin;

      const postTravelStart = endMin;
      const postTravelEnd = endMin + travelTime;

      // Add to blockingWindows
      blockingWindows.push({
        startTime: minutesToTime(preTravelStart),
        endTime: minutesToTime(preTravelEnd),
        reason: 'Travel to customer location'
      });

      blockingWindows.push({
        startTime: minutesToTime(postTravelStart),
        endTime: minutesToTime(postTravelEnd),
        reason: 'Travel back to salon'
      });

      // Add to blockedTravelWindows
      blockedTravelWindows.push({
        startTime: minutesToTime(preTravelStart),
        endTime: minutesToTime(preTravelEnd),
        reason: 'Travel to customer location',
        type: 'pre-travel'
      });

      blockedTravelWindows.push({
        startTime: minutesToTime(postTravelStart),
        endTime: minutesToTime(postTravelEnd),
        reason: 'Travel back to salon',
        type: 'post-travel'
      });
    }

    const appointment = new AppointmentModel({
      vendorId: weddingPackage.vendorId,
      regionId: vendor?.regionId || null, // <--- Added Region ID
      clientId: customerDetails?.userId || null,
      clientName: clientName || customerDetails?.name || 'Guest',
      clientEmail: customerDetails?.email || null,
      clientPhone: customerDetails?.phone || null,
      service: primaryServiceId, // Use first service from package or package ID
      serviceName: weddingPackage.name,
      staffName: primaryStaffName, // Required field - use team member or default
      date: new Date(selectedSlot.date),
      startTime: selectedSlot.startTime,
      endTime: selectedSlot.endTime,
      duration: weddingPackage.duration || 120,
      amount: subtotal,
      totalAmount: subtotal,
      discount: discount,
      discountAmount: discountAmount,
      couponCode: selectedSlot.couponCode || null,
      platformFee: platformFee,
      serviceTax: serviceTax,
      taxRate: taxRate,
      finalAmount: finalAmount,
      status: 'scheduled', // Confirmed booking
      paymentStatus: paymentDetails?.status || 'pending',
      paymentMethod: paymentDetails?.method || 'Pay at Salon',
      // Update amountPaid and amountRemaining if payment was completed
      amountPaid: (paymentDetails?.status === 'completed') ? finalAmount : 0,
      amountRemaining: (paymentDetails?.status === 'completed') ? 0 : finalAmount,
      // Add payment history if completed
      paymentHistory: (paymentDetails?.status === 'completed') ? [{
        amount: finalAmount,
        paymentMethod: paymentDetails?.method || 'Pay Online',
        paymentDate: new Date(),
        notes: 'Online payment confirmed during booking',
        transactionId: paymentDetails?.razorpayPaymentId || null
      }] : [],
      razorpayPaymentId: paymentDetails?.razorpayPaymentId || null,
      razorpayOrderId: paymentDetails?.razorpayOrderId || body.razorpayOrderId || null,
      isWeddingService: true,
      staffMembers: teamMembers, // Store at root level for easier querying
      weddingPackageDetails: {
        packageId: weddingPackage._id,
        packageName: weddingPackage.name,
        packageServices: (customizedPackageServices || weddingPackage.services || []).map(svc => {
          // Parse duration if it's a string (e.g., "45 min")
          let duration = svc.duration !== undefined ? svc.duration : (svc.serviceDuration !== undefined ? svc.serviceDuration : 0);
          if (typeof duration === 'string') {
            const match = duration.match(/(\d+)/);
            duration = match ? parseInt(match[1]) : 0;
          }

          const isCustomized = !!customizedPackageServices && customizedPackageServices.length > 0;

          return {
            serviceId: svc.serviceId || svc.id || svc._id,
            serviceName: svc.serviceName || svc.name,
            duration: Number(duration) || 0,
            amount: Number(svc.amount !== undefined ? svc.amount : (isCustomized ? (svc.price !== undefined ? svc.price : (svc.servicePrice !== undefined ? svc.servicePrice : 0)) : (svc.discountedPrice !== undefined ? svc.discountedPrice : (svc.serviceDiscountedPrice !== undefined && svc.serviceDiscountedPrice !== null ? svc.serviceDiscountedPrice : (svc.price !== undefined ? svc.price : (svc.servicePrice !== undefined ? svc.servicePrice : 0)))))),
            originalAmount: Number(svc.originalAmount !== undefined ? svc.originalAmount : (svc.price !== undefined ? svc.price : (svc.servicePrice !== undefined ? svc.servicePrice : 0))),
            vendorId: svc.vendorId || weddingPackage.vendorId,
            staffId: svc.staffId || null
          };
        }),
        teamMembers: teamMembers
      },
      homeServiceLocation: selectedSlot.location || null,
      isHomeService: !!selectedSlot.location,
      travelTime: travelTime,
      travelDistance: travelDistance,
      distanceMeters: distanceMeters,
      blockingWindows: blockingWindows,
      blockedTravelWindows: blockedTravelWindows,
      lockToken: lockId,
      mode: 'online',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Increment coupon redemption count and total discount if applicable
    if (selectedSlot.couponCode) {
      try {
        const discountToTrack = selectedSlot.discountAmount || selectedSlot.discount || 0;
        const CRMOfferModel = (await import('@repo/lib/models/Vendor/CRMOffer.model')).default;
        const crmResult = await CRMOfferModel.incrementRedemption(selectedSlot.couponCode, discountToTrack);
        if (!crmResult) {
          const AdminOfferModel = (await import('@repo/lib/models/admin/AdminOffers.model.js')).default;
          await AdminOfferModel.incrementRedemption(selectedSlot.couponCode, discountToTrack);
        }
        console.log(`Incremented redemption count and discount for wedding coupon: ${selectedSlot.couponCode}`);
      } catch (offerErr) {
        console.error(`Error incrementing wedding coupon redemption for ${selectedSlot.couponCode}:`, offerErr);
      }
    }

    await appointment.save();
    console.log("Appointment confirmed and saved:", appointment._id);

    // Check and credit referral bonus if user was referred (triggers on first wedding package booking)
    if (appointment.clientId) {
      try {
        await checkAndCreditReferralBonus(appointment.clientId.toString(), 'wedding_package');
      } catch (referralError) {
        // Don't fail the booking if referral crediting fails, just log the error
        console.error('Error crediting referral bonus:', referralError);
      }
    }

    // Release the lock after appointment creation
    try {
      const { releaseLock } = await import('@repo/lib/modules/scheduling/OptimisticLocking');
      await releaseLock(lockId);
      console.log("Lock released:", lockId);
    } catch (lockError) {
      console.warn("Could not release lock (may have expired):", lockError.message);
    }

    const confirmResult = {
      success: true,
      appointment: {
        id: appointment._id.toString(),
        status: appointment.status,
        paymentStatus: appointment.paymentStatus,
        paymentMethod: appointment.paymentMethod,
        date: appointment.date,
        startTime: appointment.startTime,
        endTime: appointment.endTime
      },
      message: 'Wedding package booking confirmed successfully'
    };

    console.log("=== CONFIRM RESULT SUCCESS ===", confirmResult);
    return NextResponse.json(confirmResult);
  } catch (error) {
    console.error('=== ERROR IN PUT ENDPOINT ===');
    console.error('Error confirming wedding package booking:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
