import { NextResponse } from 'next/server';
import connectDB from '@repo/lib/db';
import EnhancedWeddingPackageModel from '@repo/lib/models/Vendor/EnhancedWeddingPackage.model';

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
    
    // Find the wedding package - try both model names
    let weddingPackage;
    
    // First, check if packageId is a valid ObjectId
    const mongoose = await import('mongoose');
    if (!mongoose.default.Types.ObjectId.isValid(packageId)) {
      console.log("Invalid ObjectId format:", packageId);
      return NextResponse.json(
        { success: false, message: 'Invalid package ID format' },
        { status: 400 }
      );
    }
    
    try {
      console.log("Trying EnhancedWeddingPackageModel...");
      weddingPackage = await EnhancedWeddingPackageModel.findById(packageId).lean();
      console.log("EnhancedWeddingPackageModel result:", !!weddingPackage);
      if (weddingPackage) {
        console.log("Found in EnhancedWeddingPackage:", { id: weddingPackage._id, name: weddingPackage.name });
      }
    } catch (modelError) {
      console.error("Error with EnhancedWeddingPackageModel:", modelError);
    }
    
    // If not found in Enhanced, try regular WeddingPackage model
    if (!weddingPackage) {
      console.log("Not found in EnhancedWeddingPackage, trying WeddingPackage model...");
      try {
        const WeddingPackageModel = (await import('@repo/lib/models/Vendor/WeddingPackage.model')).default;
        weddingPackage = await WeddingPackageModel.findById(packageId).lean();
        console.log("WeddingPackageModel result:", !!weddingPackage);
        if (weddingPackage) {
          console.log("Found in WeddingPackage:", { id: weddingPackage._id, name: weddingPackage.name });
        }
      } catch (wpError) {
        console.error("Error with WeddingPackageModel:", wpError);
      }
    }
    
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
    
    // Acquire lock - this just reserves the slot in Redis
    // CRITICAL: startTime must be provided to create a time-specific lock
    const lockToken = await acquireLock({
      vendorId: weddingPackage.vendorId.toString(),
      staffId: `wedding-${selectedSlot.startTime}`, // Make staffId time-specific to avoid day-wide locks
      date: new Date(selectedSlot.date),
      startTime: selectedSlot.startTime, // Use startTime parameter
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
    const { packageId, lockId, selectedSlot, clientName, customerDetails, paymentDetails } = body;

    if (!packageId || !lockId || !selectedSlot) {
      console.log("Missing required fields:", { packageId: !!packageId, lockId: !!lockId, selectedSlot: !!selectedSlot });
      return NextResponse.json(
        { success: false, message: 'Missing required fields: packageId, lockId, or selectedSlot' },
        { status: 400 }
      );
    }

    console.log("Confirming wedding package booking for package:", packageId);
    
    // Find the wedding package again
    let weddingPackage;
    const mongoose = await import('mongoose');
    
    try {
      weddingPackage = await EnhancedWeddingPackageModel.findById(packageId).lean();
      console.log("EnhancedWeddingPackageModel result:", !!weddingPackage);
    } catch (error) {
      console.error("Error with EnhancedWeddingPackageModel:", error);
    }
    
    if (!weddingPackage) {
      const WeddingPackageModel = (await import('@repo/lib/models/Vendor/WeddingPackage.model')).default;
      weddingPackage = await WeddingPackageModel.findById(packageId).lean();
      console.log("WeddingPackageModel result:", !!weddingPackage);
    }
    
    if (!weddingPackage) {
      return NextResponse.json(
        { success: false, message: 'Wedding package not found' },
        { status: 404 }
      );
    }

    // Now create the appointment with payment confirmation
    const AppointmentModel = (await import('@repo/lib/models/Appointment/Appointment.model')).default;
    
    console.log("Creating confirmed appointment after payment...");
    
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
    
    const appointment = new AppointmentModel({
      vendorId: weddingPackage.vendorId,
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
      amount: selectedSlot.totalAmount || weddingPackage.discountedPrice || weddingPackage.totalPrice,
      totalAmount: selectedSlot.totalAmount || weddingPackage.discountedPrice || weddingPackage.totalPrice,
      finalAmount: selectedSlot.totalAmount || weddingPackage.discountedPrice || weddingPackage.totalPrice,
      status: 'scheduled', // Confirmed booking
      paymentStatus: paymentDetails?.status || 'pending',
      paymentMethod: paymentDetails?.method || 'Pay at Salon',
      isWeddingService: true,
      staffMembers: teamMembers, // Store at root level for easier querying
      weddingPackageDetails: {
        packageId: weddingPackage._id,
        packageName: weddingPackage.name,
        packageServices: weddingPackage.services || [],
        teamMembers: teamMembers
      },
      homeServiceLocation: selectedSlot.location || null,
      isHomeService: !!selectedSlot.location,
      lockToken: lockId,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await appointment.save();
    console.log("Appointment confirmed and saved:", appointment._id);

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
