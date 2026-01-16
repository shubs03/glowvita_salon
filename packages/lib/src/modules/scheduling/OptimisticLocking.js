import crypto from 'crypto';
import mongoose from 'mongoose';

/**
 * Optimistic Locking Module
 * Implements atomic distributed locks for appointment slot reservation
 */

// In-memory store for locks (in production, use Redis or similar)
const locks = new Map();
const LOCK_TTL = 30 * 60 * 1000; // 30 minutes

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
    let vendorId, staffId, date, timeSlot, ttl = LOCK_TTL;
    
    if (typeof params === 'object' && params !== null) {
      // New signature with object parameter
      vendorId = params.vendorId || params.packageId; // For wedding packages, use packageId as vendorId
      staffId = params.staffId;
      date = params.date;
      timeSlot = params.startTime; // Using startTime as the timeSlot
      ttl = params.ttl || LOCK_TTL;
    } else {
      // Old signature with individual parameters
      vendorId = params;
      staffId = arguments[1];
      date = arguments[2];
      timeSlot = arguments[3];
      ttl = arguments[4] || LOCK_TTL;
    }
    
    const lockKey = generateLockKey(vendorId, staffId, date, timeSlot);
    const lockToken = crypto.randomBytes(16).toString('hex');
    const expiration = Date.now() + ttl;
    
    console.log('Acquiring lock with parameters:', { vendorId, staffId, date, timeSlot, ttl });
    console.log('Acquiring lock with key:', lockKey);
    console.log('Generated lock token:', lockToken);
    console.log('Lock expiration:', new Date(expiration));
    
    // Check if lock already exists and is still valid
    if (locks.has(lockKey)) {
      const existingLock = locks.get(lockKey);
      console.log('Existing lock found:', existingLock);
      if (existingLock.expiration > Date.now()) {
        // Lock is still held by someone else
        const timeRemaining = Math.round((existingLock.expiration - Date.now()) / 1000);
        console.log(`Lock already held for ${lockKey}, expires in ${timeRemaining} seconds`);
        return null;
      } else {
        // Lock has expired, remove it
        console.log('Removing expired lock:', lockKey);
        locks.delete(lockKey);
      }
    }
    
    // Acquire the lock
    locks.set(lockKey, {
      token: lockToken,
      expiration: expiration,
      vendorId,
      staffId,
      date: date.toISOString().split('T')[0],
      timeSlot
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
    
    // Add lock information to appointment data
    const tempAppointmentData = {
      status: 'temp-locked',
      lockToken: lockToken,
      lockExpiration: new Date(Date.now() + LOCK_TTL),
      createdAt: new Date(),
      updatedAt: new Date(),
      // Ensure all required fields are populated
      vendorId: cleanAppointmentData.vendorId,
      regionId: vendorRegionId, // <--- Added Region ID
      clientName: cleanAppointmentData.clientName || 'Temporary Client',
      service: cleanAppointmentData.serviceId,
      serviceName: cleanAppointmentData.serviceName || 'Temporary Service',
      staffName: cleanAppointmentData.staffName || 'Any Professional',
      date: cleanAppointmentData.date || new Date(),
      startTime: cleanAppointmentData.startTime || '00:00',
      endTime: cleanAppointmentData.endTime || '00:00',
      duration: cleanAppointmentData.duration || 0,
      amount: cleanAppointmentData.amount || 0,
      totalAmount: cleanAppointmentData.totalAmount || cleanAppointmentData.amount || 0,
      finalAmount: cleanAppointmentData.finalAmount || cleanAppointmentData.totalAmount || cleanAppointmentData.amount || 0,
      mode: 'online', // Web bookings are always online
      isHomeService: cleanAppointmentData.isHomeService || false,
      isWeddingService: cleanAppointmentData.isWeddingService || false
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
    
    // Create a temporary appointment in the database
    const tempAppointment = new Appointment(tempAppointmentData);
    console.log('Temporary appointment before save:', tempAppointment);
    
    // Save the appointment and log the result
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
 * @returns {Promise<Object>} - Confirmed appointment
 */
export async function confirmAppointment(appointmentId, lockToken, paymentDetails) {
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
    appointment.paymentDetails = paymentDetails;
    appointment.confirmedAt = new Date();
    
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