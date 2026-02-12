import crypto from 'crypto';
import mongoose from 'mongoose';

/**
 * Optimistic Locking Module
 * Implements atomic distributed locks for appointment slot reservation
 */

// In-memory store for locks (in production, use Redis or similar)
const locks = new Map();
const LOCK_TTL = 15 * 60 * 1000; // 15 minutes (Standard for booking flows)

/**
 * Clean up expired locks periodically
 */
function cleanupExpiredLocks() {
  const now = Date.now();
  let cleanedCount = 0;

  for (const [key, lock] of locks.entries()) {
    if (lock.expiration < now) {
      locks.delete(key);
      cleanedCount++;
    }
  }

  if (cleanedCount > 0) {
    console.log(`Cleaned up ${cleanedCount} expired locks`);
  }
}

// Run cleanup every 5 minutes
setInterval(cleanupExpiredLocks, 5 * 60 * 1000);

/**
 * Generate a unique lock key
 * @param {string} vendorId - Vendor ID
 * @param {string} staffId - Staff ID (can be 'any' or specific ID)
 * @param {Date} date - Appointment date
 * @param {string} timeSlot - Time slot (HH:MM)
 * @returns {string} - Unique lock key
 */
function generateLockKey(vendorId, staffId, date, timeSlot) {
  // For wedding packages or team bookings with 'any' staff, use vendor+date+time only
  // This allows multiple customers to book different slots but prevents double-booking same slot
  const dateStr = date instanceof Date ? date.toISOString().split('T')[0] : date;
  if (staffId === 'any') {
    return `lock:${vendorId}:${dateStr}:${timeSlot}`;
  }
  return `lock:${vendorId}:${staffId}:${dateStr}:${timeSlot}`;
}

/**
 * Acquire a distributed lock for a time slot
 * @param {string} vendorId - Vendor ID
 * @param {string} staffId - Staff ID
 * @param {Date} date - Appointment date
 * @param {string} timeSlot - Time slot (HH:MM)
 * @param {number} ttl - Time to live in milliseconds
 * @returns {Promise<string|null>} - Lock token if acquired, null if failed
 */
export async function acquireLock(params) {
  try {
    // Handle both old signature (individual params) and new signature (object param)
    let vendorId, staffId, date, startTime, duration, ttl = LOCK_TTL;

    if (typeof params === 'object' && params !== null) {
      // New signature with object parameter
      vendorId = params.vendorId || params.packageId;
      staffId = params.staffId;
      date = params.date;
      startTime = params.startTime;
      duration = params.duration;
      ttl = params.ttl || LOCK_TTL;
    } else {
      // Old signature
      vendorId = params;
      staffId = arguments[1];
      date = arguments[2];
      startTime = arguments[3];
      ttl = arguments[4] || LOCK_TTL;
      // Duration not available in old signature, we'll estimate or just check start time
    }

    // [CRITICAL] DATABASE-BACKED CONFLICT DETECTION
    // Instead of just checking in-memory, we MUST check for overlapping appointments in the DB
    // This handles distributed environments (multiple server instances)
    const { checkMultiServiceConflict, checkStaffConflict } = await import('./ConflictChecker.js');

    let conflict = null;
    if (params.serviceItems && params.serviceItems.length > 0) {
      conflict = await checkMultiServiceConflict(vendorId, date, params.serviceItems);
    } else if (staffId && staffId !== 'any') {
      // Calculate endTime if not provided
      let endTime = params.endTime;
      if (!endTime && duration) {
        const [h, m] = startTime.split(':').map(Number);
        const totalMin = h * 60 + m + Number(duration);
        endTime = `${Math.floor(totalMin / 60).toString().padStart(2, '0')}:${(totalMin % 60).toString().padStart(2, '0')}`;
      }

      if (endTime) {
        conflict = await checkStaffConflict({
          vendorId,
          staffId,
          date,
          startTime,
          endTime
        });
      }
    }

    if (conflict) {
      console.warn(`Lock acquisition failed: Conflict with existing appointment ${conflict._id}`);
      return null;
    }

    const lockKey = generateLockKey(vendorId, staffId, date, startTime);
    const lockToken = crypto.randomBytes(16).toString('hex');
    const expiration = Date.now() + ttl;

    // Check in-memory Map as a fast second-level check
    if (locks.has(lockKey)) {
      const existingLock = locks.get(lockKey);
      if (existingLock.expiration > Date.now()) {
        const incomingClientId = params.clientId || (typeof params === 'object' ? params.clientId : null);
        if (incomingClientId && incomingClientId !== 'temp-client-id' && existingLock.clientId === incomingClientId) {
          locks.delete(lockKey);
        } else {
          return null;
        }
      } else {
        locks.delete(lockKey);
      }
    }

    // Acquire the lock
    locks.set(lockKey, {
      token: lockToken,
      expiration: expiration,
      vendorId,
      staffId,
      date: date instanceof Date ? date.toISOString().split('T')[0] : new Date(date).toISOString().split('T')[0],
      timeSlot: startTime,
      clientId: params.clientId || 'temp-client-id'
    });

    console.log(`Lock acquired: ${lockKey}`);
    return lockToken;
  } catch (error) {
    console.error('Error acquiring lock:', error);
    throw error;
  }
}

/**
 * Release a distributed lock
 * @param {string} vendorId - Vendor ID
 * @param {string} staffId - Staff ID
 * @param {Date} date - Appointment date
 * @param {string} timeSlot - Time slot (HH:MM)
 * @param {string} lockToken - Lock token
 * @returns {Promise<boolean>} - True if released, false if not owned
 */
export async function releaseLock(vendorId, staffId, date, timeSlot, lockToken) {
  try {
    const lockKey = generateLockKey(vendorId, staffId, date, timeSlot);

    console.log('Releasing lock with key:', lockKey);
    console.log('Lock token provided:', lockToken);

    // Check if lock exists and is owned by this token
    if (locks.has(lockKey)) {
      const lock = locks.get(lockKey);
      console.log('Lock found in memory:', lock);

      if (lock.token === lockToken) {
        // Release the lock
        locks.delete(lockKey);
        console.log(`Lock released: ${lockKey}`);
        return true;
      } else {
        console.log(`Lock token mismatch - Expected: ${lock.token}, Actual: ${lockToken}`);
      }
    }

    console.log(`Lock not released (not owned or doesn't exist): ${lockKey}`);
    return false;
  } catch (error) {
    console.error('Error releasing lock:', error);
    throw error;
  }
}

/**
 * Check if a lock is still valid
 * @param {string} vendorId - Vendor ID
 * @param {string} staffId - Staff ID
 * @param {Date} date - Appointment date
 * @param {string} timeSlot - Time slot (HH:MM)
 * @returns {Promise<boolean>} - True if lock is valid, false otherwise
 */
export async function isLockValid(vendorId, staffId, date, timeSlot) {
  try {
    const lockKey = generateLockKey(vendorId, staffId, date, timeSlot);

    console.log('Checking lock validity with key:', lockKey);

    if (locks.has(lockKey)) {
      const lock = locks.get(lockKey);
      const isValid = lock.expiration > Date.now();
      console.log('Lock found in memory:', lock);
      console.log('Lock is valid:', isValid);
      return isValid;
    }

    console.log('Lock not found in memory');
    return false;
  } catch (error) {
    console.error('Error checking lock validity:', error);
    throw error;
  }
}

/**
 * Create a temporary locked appointment record
 * @param {Object} appointmentData - Appointment data
 * @param {string} lockToken - Lock token
 * @returns {Promise<Object>} - Temporary appointment record
 */
export async function createTemporaryAppointment(appointmentData, lockToken) {
  try {
    // Import the Appointment model
    const Appointment = (await import('../../models/Appointment/Appointment.model.js')).default;

    // Extract travel time info and location if present
    const { travelTimeInfo, location, ...cleanAppointmentData } = appointmentData;

    // Helper to check if a string is a valid ObjectId
    const isValidObjectId = (str) => {
      return str && typeof str === 'string' && /^[0-9a-fA-F]{24}$/.test(str);
    };

    // Lookup Vendor Region
    const VendorModel = (await import('../../models/Vendor/Vendor.model.js')).default;
    let vendorRegionId = null;
    try {
      if (cleanAppointmentData.vendorId && isValidObjectId(cleanAppointmentData.vendorId)) {
        const vendor = await VendorModel.findById(cleanAppointmentData.vendorId).select('regionId').lean();
        if (vendor && vendor.regionId) {
          vendorRegionId = vendor.regionId;
        }
      }
    } catch (err) {
      console.error("Error fetching vendor region for appointment:", err);
    }

    // CRITICAL FIX: Calculate fees if missing
    let finalPlatformFee = Math.round(cleanAppointmentData.platformFee || 0);
    let finalServiceTax = Math.round(cleanAppointmentData.serviceTax || 0);
    let finalTaxRate = cleanAppointmentData.taxRate || 0;
    let finalAmount = Math.round(cleanAppointmentData.finalAmount || cleanAppointmentData.totalAmount || cleanAppointmentData.amount || 0);
    
    // If fees are 0 but we have an amount, try to calculate them
    if ((finalPlatformFee === 0 || finalServiceTax === 0) && cleanAppointmentData.amount > 0) {
      console.log('⚠️ Platform fee or service tax is 0, attempting to calculate from tax settings...');
      
      try {
        const TaxFeeSettings = (await import('../../models/admin/TaxFeeSettings.model.js')).default;
        const taxSettings = await TaxFeeSettings.getLatestSettings();
        
        if (taxSettings) {
          const baseAmount = cleanAppointmentData.totalAmount || cleanAppointmentData.amount || 0;
          
          // Calculate platform fee if enabled and not provided
          if (finalPlatformFee === 0 && taxSettings.platformFeeEnabled) {
            if (taxSettings.platformFeeType === 'percentage') {
              finalPlatformFee = Math.round((baseAmount * taxSettings.platformFee) / 100);
            } else {
              finalPlatformFee = Math.round(taxSettings.platformFee);
            }
            console.log('✅ Calculated platform fee:', finalPlatformFee);
          }
          
          // Calculate service tax (GST) if enabled and not provided
          if (finalServiceTax === 0 && taxSettings.serviceTaxEnabled) {
            if (taxSettings.serviceTaxType === 'percentage') {
              finalServiceTax = Math.round((baseAmount * taxSettings.serviceTax) / 100);
              finalTaxRate = taxSettings.serviceTax;
            } else {
              finalServiceTax = Math.round(taxSettings.serviceTax);
            }
            console.log('✅ Calculated service tax (GST):', finalServiceTax);
          }
          
          // Recalculate final amount if fees were calculated
          if (finalPlatformFee > 0 || finalServiceTax > 0) {
            const discountAmount = Math.round(cleanAppointmentData.discountAmount || 0);
            finalAmount = Math.round(baseAmount + finalPlatformFee + finalServiceTax - discountAmount);
            console.log('✅ Recalculated final amount:', finalAmount);
          }
        }
      } catch (error) {
        console.error('Error calculating fees from tax settings:', error);
        // Continue with original values
      }
    }

    // Add lock information to appointment data
    const tempAppointmentData = {
      ...cleanAppointmentData, // Spread the original data first
      status: 'temp-locked',
      lockToken: lockToken,
      lockExpiration: new Date(Date.now() + LOCK_TTL),
      createdAt: new Date(),
      updatedAt: new Date(),
      // Ensure all required fields are populated, falling back if necessary
      vendorId: cleanAppointmentData.vendorId,
      regionId: vendorRegionId, // <--- Added Region ID
      clientName: cleanAppointmentData.clientName || 'Temporary Client',
      clientEmail: cleanAppointmentData.clientEmail || '',
      clientPhone: cleanAppointmentData.clientPhone || '',
      service: cleanAppointmentData.serviceId,
      serviceName: cleanAppointmentData.serviceName || 'Temporary Service',
      staffName: cleanAppointmentData.staffName || 'Any Professional',
      date: cleanAppointmentData.date || new Date(),
      startTime: cleanAppointmentData.startTime || '00:00',
      endTime: cleanAppointmentData.endTime || '00:00',
      duration: cleanAppointmentData.duration || 0,
      amount: Math.round(cleanAppointmentData.amount || 0),
      totalAmount: Math.round(cleanAppointmentData.totalAmount || cleanAppointmentData.amount || 0),
      finalAmount: finalAmount,
      platformFee: finalPlatformFee,
      serviceTax: finalServiceTax,
      taxRate: finalTaxRate,
      couponCode: cleanAppointmentData.couponCode || null,
      discountAmount: Math.round(cleanAppointmentData.discountAmount || 0),
      discount: cleanAppointmentData.discount || 0,
      mode: 'online', // Web bookings are always online
      isHomeService: cleanAppointmentData.isHomeService || false,
      isWeddingService: cleanAppointmentData.isWeddingService || false,
      // Prioritize serviceItems from input data
      serviceItems: appointmentData.serviceItems || []
    };

    // Only add client if it's a valid ObjectId
    if (isValidObjectId(cleanAppointmentData.clientId)) {
      tempAppointmentData.client = cleanAppointmentData.clientId;
    }

    // Only add staff if it's a valid ObjectId (not 'any')
    if (isValidObjectId(cleanAppointmentData.staffId)) {
      tempAppointmentData.staff = cleanAppointmentData.staffId;
    }

    // Add packageId if present
    if (cleanAppointmentData.packageId) {
      tempAppointmentData.weddingPackageDetails = {
        packageId: cleanAppointmentData.packageId,
        packageServices: []
      };
    }

    // Add travel time information if available
    if (travelTimeInfo) {
      tempAppointmentData.travelTime = travelTimeInfo.timeInMinutes || 0;
      tempAppointmentData.travelDistance = travelTimeInfo.distanceInKm || 0;
      tempAppointmentData.distanceMeters = travelTimeInfo.distanceInMeters || 0;
    }

    // Add home service location information if available
    if (location) {
      tempAppointmentData.homeServiceLocation = {
        address: location.address || '',
        city: location.city || '',
        state: location.state || '',
        pincode: location.pincode || '',
        landmark: location.landmark || '',
        lat: Number(location.lat) || 0,
        lng: Number(location.lng) || 0
      };
    }

    console.log('Creating temporary appointment with data:', tempAppointmentData);

    // If serviceItems exist, process them to include full add-on details
    if (Array.isArray(tempAppointmentData.serviceItems) && tempAppointmentData.serviceItems.length > 0) {
      const AddOnModel = (await import('../../models/Vendor/AddOn.model.js')).default;

      for (const item of tempAppointmentData.serviceItems) {
        if (Array.isArray(item.addOns) && item.addOns.length > 0) {
          const addOnIds = item.addOns.map(addOn => addOn.id || addOn._id || addOn);
          const addOnObjects = await AddOnModel.find({ _id: { $in: addOnIds } }).lean();

          // Map the full add-on objects back
          item.addOns = addOnObjects.map(obj => ({
            _id: obj._id,
            name: obj.name,
            price: obj.price,
            duration: obj.duration
          }));
        }
      }

      // Populate top-level fields from the primary service item
      const primaryService = tempAppointmentData.serviceItems[0];
      tempAppointmentData.service = primaryService.service;
      tempAppointmentData.serviceName = primaryService.serviceName;
      tempAppointmentData.staff = primaryService.staff;
      tempAppointmentData.staffName = primaryService.staffName;
      tempAppointmentData.startTime = primaryService.startTime;
      tempAppointmentData.endTime = primaryService.endTime;
      // Use totalDuration (base + addons) for the top-level duration field
      tempAppointmentData.duration = primaryService.totalDuration || primaryService.duration;
      tempAppointmentData.amount = primaryService.amount;

      // Sync addOns and addOnsAmount from primary service
      if (primaryService.addOns && primaryService.addOns.length > 0) {
        tempAppointmentData.addOns = primaryService.addOns;
        tempAppointmentData.addOnsAmount = primaryService.addOns.reduce((sum, a) => sum + (a.price || 0), 0);
      }

      // propagate buffers and travel info to primary service item for internal reference
      primaryService.travelTime = tempAppointmentData.travelTime || 0;
      primaryService.travelDistance = tempAppointmentData.travelDistance || 0;
      primaryService.distanceMeters = tempAppointmentData.distanceMeters || 0;
      primaryService.bufferBefore = tempAppointmentData.bufferBefore;
      primaryService.bufferAfter = tempAppointmentData.bufferAfter;
    }

    // Process top-level addOns if they exist and are just IDs
    if (Array.isArray(tempAppointmentData.addOns) && tempAppointmentData.addOns.length > 0) {
      const AddOnModel = (await import('../../models/Vendor/AddOn.model.js')).default;
      const addOnIds = tempAppointmentData.addOns.map(addOn => addOn.id || addOn._id || (typeof addOn === 'string' ? addOn : null)).filter(Boolean);

      if (addOnIds.length > 0) {
        const addOnObjects = await AddOnModel.find({ _id: { $in: addOnIds } }).lean();
        tempAppointmentData.addOns = addOnObjects.map(obj => ({
          _id: obj._id,
          name: obj.name,
          price: obj.price,
          duration: obj.duration || 0
        }));
      }
    }

    // Calculate staff commission if enabled
    try {
      const { default: StaffModel } = await import('../../models/Vendor/Staff.model.js');

      // Populate commission for top-level staff
      if (tempAppointmentData.staff && mongoose.Types.ObjectId.isValid(tempAppointmentData.staff)) {
        const staffMember = await StaffModel.findById(tempAppointmentData.staff);
        if (staffMember && staffMember.commission) {
          const rate = staffMember.commissionRate || 0;
          tempAppointmentData.staffCommission = {
            rate: rate,
            amount: (tempAppointmentData.finalAmount * rate) / 100
          };
        }
      }

      // Populate commission for service items
      if (tempAppointmentData.serviceItems && tempAppointmentData.serviceItems.length > 0) {
        const staffIds = [...new Set(tempAppointmentData.serviceItems.map(item => item.staff).filter(Boolean))];
        if (staffIds.length > 0) {
          const staffMembers = await StaffModel.find({ _id: { $in: staffIds } });
          const staffMap = new Map(staffMembers.map(s => [s._id.toString(), s]));

          tempAppointmentData.serviceItems = tempAppointmentData.serviceItems.map(item => {
            if (item.staff) {
              const staff = staffMap.get(item.staff.toString());
              if (staff && staff.commission) {
                const rate = staff.commissionRate || 0;
                return {
                  ...item,
                  staffCommission: {
                    rate: rate,
                    amount: (item.amount * rate) / 100
                  }
                };
              }
            }
            return item;
          });
        }
      }
    } catch (commissionErr) {
      console.error("Error calculating staff commission for temporary appointment:", commissionErr);
    }

    // Create a temporary appointment in the database
    const tempAppointment = new Appointment(tempAppointmentData);

    // Explicitly set these fields to ensure they are captured even if schema was recently updated
    if (tempAppointmentData.couponCode) tempAppointment.couponCode = tempAppointmentData.couponCode;
    if (tempAppointmentData.discountAmount) tempAppointment.discountAmount = tempAppointmentData.discountAmount;

    console.log('Temporary appointment before save:', tempAppointment);
    const savedAppointment = await tempAppointment.save();
    console.log('Temporary appointment after save:', savedAppointment);
    console.log('Lock token stored in DB:', savedAppointment.lockToken);
    console.log('Appointment ID:', savedAppointment._id);

    // Verify that the lock token was saved correctly
    if (savedAppointment.lockToken !== lockToken) {
      console.error('Lock token mismatch after save - Expected:', lockToken, 'Actual:', savedAppointment.lockToken);
    }

    return savedAppointment;
  } catch (error) {
    console.error('Error creating temporary appointment:', error);
    throw error;
  }
}

/**
 * Confirm a temporary appointment (move from locked to confirmed)
 * @param {string} appointmentId - Appointment ID
 * @param {string} lockToken - Lock token
 * @param {Object} paymentDetails - Payment details
 * @param {Object} couponData - Optional coupon data { couponCode, discountAmount }
 * @returns {Promise<Object>} - Confirmed appointment
 */
export async function confirmAppointment(appointmentId, lockToken, paymentDetails, couponData = {}) {
  try {
    // Import the Appointment model
    const Appointment = (await import('../../models/Appointment/Appointment.model.js')).default;

    console.log('Attempting to confirm appointment:', appointmentId);
    console.log('Lock token provided:', lockToken);

    // Find the temporary appointment
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      console.error('Appointment not found:', appointmentId);
      throw new Error('Appointment not found');
    }

    console.log('Appointment found in DB:', appointment);
    console.log('Lock token from DB:', appointment.lockToken);
    console.log('Lock token from request:', lockToken);
    console.log('Lock expiration from DB:', appointment.lockExpiration);
    console.log('Current time:', new Date());

    // Verify the lock token matches the appointment
    if (appointment.lockToken !== lockToken) {
      console.error('Lock token mismatch - DB:', appointment.lockToken, 'Request:', lockToken);
      // Log additional details for debugging
      console.error('Appointment ID from DB:', appointment._id);
      console.error('Appointment status:', appointment.status);
      throw new Error('Invalid lock token');
    }

    // Check that the lock hasn't expired
    if (appointment.lockExpiration < new Date()) {
      console.error('Lock has expired - Expiration:', appointment.lockExpiration, 'Current time:', new Date());
      throw new Error('Lock has expired');
    }

    // Update the appointment status to 'scheduled' (as per the model default)
    appointment.status = 'scheduled';

    // Set payment details and confirmation time
    if (paymentDetails) {
      if (paymentDetails.paymentMethod) appointment.paymentMethod = paymentDetails.paymentMethod;
      else if (paymentDetails.method) appointment.paymentMethod = paymentDetails.method;

      if (paymentDetails.paymentStatus) appointment.paymentStatus = paymentDetails.paymentStatus;
      else if (paymentDetails.status) appointment.paymentStatus = paymentDetails.status;

      // Keep paymentDetails for backward compatibility if any field uses it as a map
      appointment.paymentDetails = paymentDetails;
    }

    appointment.confirmedAt = new Date();

    // Update coupon data if provided in confirmation request
    if (couponData.couponCode) {
      appointment.couponCode = couponData.couponCode;
    }
    if (couponData.discountAmount !== undefined) {
      appointment.discountAmount = Math.round(couponData.discountAmount);
    }
    if (couponData.finalAmount !== undefined) {
      console.log(`Setting finalAmount for appointment ${appointmentId}: ${couponData.finalAmount} (discount: ${couponData.discountAmount})`);
      appointment.finalAmount = Math.round(couponData.finalAmount);
    }
    
    // Update fee data if provided in confirmation request
    if (couponData.platformFee !== undefined) {
      appointment.platformFee = Math.round(couponData.platformFee);
      console.log(`Updated platformFee: ${appointment.platformFee}`);
    }
    if (couponData.serviceTax !== undefined) {
      appointment.serviceTax = Math.round(couponData.serviceTax);
      console.log(`Updated serviceTax (GST): ${appointment.serviceTax}`);
    }
    if (couponData.taxRate !== undefined) {
      appointment.taxRate = couponData.taxRate;
      console.log(`Updated taxRate: ${appointment.taxRate}`);
    }

    // Preserve home service location and travel time data
    const homeServiceLocationData = appointment.homeServiceLocation || {};
    const travelTimeData = {
      travelTime: appointment.travelTime || 0,
      travelDistance: appointment.travelDistance || 0,
      distanceMeters: appointment.distanceMeters || 0
    };

    console.log('Preserving home service location data:', homeServiceLocationData);
    console.log('Preserving travel time data:', travelTimeData);

    // Remove lock information but preserve home service location and travel time data
    appointment.lockToken = undefined;
    appointment.lockExpiration = undefined;

    // Ensure home service location data is preserved
    if (appointment.homeServiceLocation) {
      console.log('Preserving home service location data:', appointment.homeServiceLocation);
    }

    // Ensure travel time data is preserved
    if (appointment.travelTime || appointment.travelDistance || appointment.distanceMeters) {
      console.log('Preserving travel time data:', {
        travelTime: appointment.travelTime,
        travelDistance: appointment.travelDistance,
        distanceMeters: appointment.distanceMeters
      });
    }

    // Save the updated appointment
    const confirmedAppointment = await appointment.save();

    console.log(`Appointment ${appointmentId} confirmed with lock token ${lockToken}`);

    return {
      success: true,
      appointment: confirmedAppointment
    };
  } catch (error) {
    console.error('Error confirming appointment:', error);
    throw error;
  }
}

/**
 * Cancel a temporary appointment (release lock and delete temporary record)
 * @param {string} appointmentId - Appointment ID
 * @param {string} lockToken - Lock token
 * @returns {Promise<boolean>} - True if cancelled successfully
 */
export async function cancelAppointment(appointmentId, lockToken) {
  try {
    // Import the Appointment model
    const Appointment = (await import('../../models/Appointment/Appointment.model.js')).default;

    console.log('Attempting to cancel appointment:', appointmentId);
    console.log('Lock token provided:', lockToken);

    // Find the temporary appointment
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      console.warn(`Appointment ${appointmentId} not found for cancellation`);
      return false;
    }

    console.log('Appointment found for cancellation:', appointment);
    console.log('Lock token from DB:', appointment.lockToken);

    // Verify the lock token matches the appointment
    if (appointment.lockToken !== lockToken) {
      console.warn(`Invalid lock token for appointment ${appointmentId}`);
      return false;
    }

    // Release the in-memory lock as well
    if (appointment.vendorId && appointment.date && appointment.startTime) {
      const staffId = appointment.staff ? appointment.staff.toString() : 'any';
      await releaseLock(
        appointment.vendorId.toString(),
        staffId,
        appointment.date,
        appointment.startTime,
        lockToken
      );
    }

    // Delete the temporary appointment record
    await Appointment.findByIdAndDelete(appointmentId);

    console.log(`Appointment ${appointmentId} cancelled with lock token ${lockToken}`);
    return true;
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    throw error;
  }
}

/**
 * Background job to garbage collect expired locks and appointments
 * @returns {Promise<Object>} - Cleanup statistics
 */
export async function garbageCollectExpired() {
  try {
    const now = new Date();
    let expiredLocks = 0;
    let expiredAppointments = 0;

    console.log('Starting garbage collection at:', now);

    // Clean up expired locks
    for (const [key, lock] of locks.entries()) {
      if (lock.expiration <= now) {
        locks.delete(key);
        expiredLocks++;
        console.log(`Expired lock removed: ${key}`);
      }
    }

    // Clean up expired temporary appointments from the database
    const Appointment = (await import('../../models/Appointment/Appointment.model.js')).default;

    // Find and delete expired temporary appointments
    console.log('Searching for expired temporary appointments');
    const expiredAppointmentsResult = await Appointment.deleteMany({
      status: 'temp-locked',
      lockExpiration: { $lt: now }
    });

    expiredAppointments = expiredAppointmentsResult.deletedCount;

    console.log(`Garbage collection completed: ${expiredLocks} locks, ${expiredAppointments} appointments cleaned up`);

    return {
      expiredLocks,
      expiredAppointments,
      timestamp: new Date()
    };
  } catch (error) {
    console.error('Error during garbage collection:', error);
    throw error;
  }
}

/**
 * Reconcile race conditions and inconsistencies
 * @returns {Promise<Object>} - Reconciliation statistics
 */
export async function reconcileRaceConditions() {
  try {
    // Import the Appointment model
    const Appointment = (await import('../../models/Appointment/Appointment.model.js')).default;

    let reconciledItems = 0;

    console.log('Starting race condition reconciliation');

    // Check for appointments that are locked but not confirmed within TTL
    const now = new Date();
    console.log('Searching for expired temporary appointments in reconciliation');
    const expiredTempAppointments = await Appointment.find({
      status: 'temp-locked',
      lockExpiration: { $lt: now }
    });

    console.log('Found expired temporary appointments:', expiredTempAppointments.length);

    // Delete expired temporary appointments
    if (expiredTempAppointments.length > 0) {
      console.log('Deleting expired temporary appointments');
      const deleteResult = await Appointment.deleteMany({
        _id: { $in: expiredTempAppointments.map(a => a._id) }
      });
      reconciledItems += deleteResult.deletedCount;
      console.log(`Reconciled ${deleteResult.deletedCount} expired temporary appointments`);
    }

    // Check for orphaned locks (locks without corresponding appointments)
    // This would typically be done by comparing in-memory locks with database records
    // For now, we'll just log that reconciliation was attempted

    console.log(`Race condition reconciliation completed: ${reconciledItems} items reconciled`);

    return {
      reconciledItems,
      timestamp: new Date()
    };
  } catch (error) {
    console.error('Error during race condition reconciliation:', error);
    throw error;
  }
}

export default {
  acquireLock,
  releaseLock,
  isLockValid,
  createTemporaryAppointment,
  confirmAppointment,
  cancelAppointment,
  garbageCollectExpired,
  reconcileRaceConditions
};