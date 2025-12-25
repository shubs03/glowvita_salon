/**
 * Migration script for Appointment model enhancements
 * Adds new fields with sensible defaults to avoid breaking current production data
 */

import _db from '../db.js';
import AppointmentModel from '../models/Appointment/Appointment.model.js';

/**
 * Apply migration to add new fields to Appointment model
 */
export async function applyAppointmentMigration() {
  try {
    // Initialize database connection
    await _db();
    
    console.log('Starting Appointment model migration...');
    
    // Add weddingPackageDetails field with default empty object
    const weddingPackageDetailsResult = await AppointmentModel.updateMany(
      { weddingPackageDetails: { $exists: false } },
      { $set: { weddingPackageDetails: {} } }
    );
    
    console.log(`Updated ${weddingPackageDetailsResult.modifiedCount} appointments with weddingPackageDetails field`);
    
    // Add distanceMeters field with default 0
    const distanceMetersResult = await AppointmentModel.updateMany(
      { distanceMeters: { $exists: false } },
      { $set: { distanceMeters: 0 } }
    );
    
    console.log(`Updated ${distanceMetersResult.modifiedCount} appointments with distanceMeters field`);
    
    // Add blockedTravelWindows field with default empty array
    const blockedTravelWindowsResult = await AppointmentModel.updateMany(
      { blockedTravelWindows: { $exists: false } },
      { $set: { blockedTravelWindows: [] } }
    );
    
    console.log(`Updated ${blockedTravelWindowsResult.modifiedCount} appointments with blockedTravelWindows field`);
    
    // Add index for weddingPackageDetails.packageId if it doesn't exist
    try {
      await AppointmentModel.collection.createIndex(
        { "weddingPackageDetails.packageId": 1 },
        { background: true }
      );
      console.log('Created index for weddingPackageDetails.packageId');
    } catch (indexError) {
      console.log('Index for weddingPackageDetails.packageId already exists or failed to create');
    }
    
    // Add index for distanceMeters if it doesn't exist
    try {
      await AppointmentModel.collection.createIndex(
        { distanceMeters: 1 },
        { background: true }
      );
      console.log('Created index for distanceMeters');
    } catch (indexError) {
      console.log('Index for distanceMeters already exists or failed to create');
    }
    
    // Add index for blockedTravelWindows if it doesn't exist
    try {
      await AppointmentModel.collection.createIndex(
        { blockedTravelWindows: 1 },
        { background: true }
      );
      console.log('Created index for blockedTravelWindows');
    } catch (indexError) {
      console.log('Index for blockedTravelWindows already exists or failed to create');
    }
    
    console.log('Appointment model migration completed successfully');
    return {
      success: true,
      weddingPackageDetails: weddingPackageDetailsResult.modifiedCount,
      distanceMeters: distanceMetersResult.modifiedCount,
      blockedTravelWindows: blockedTravelWindowsResult.modifiedCount
    };
  } catch (error) {
    console.error('Error applying Appointment model migration:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Revert migration (for rollback purposes)
 */
export async function revertAppointmentMigration() {
  try {
    // Initialize database connection
    await _db();
    
    console.log('Reverting Appointment model migration...');
    
    // Remove weddingPackageDetails field
    const weddingPackageDetailsResult = await AppointmentModel.updateMany(
      { weddingPackageDetails: { $exists: true, $ne: {} } },
      { $unset: { weddingPackageDetails: "" } }
    );
    
    console.log(`Removed weddingPackageDetails field from ${weddingPackageDetailsResult.modifiedCount} appointments`);
    
    // Remove distanceMeters field
    const distanceMetersResult = await AppointmentModel.updateMany(
      { distanceMeters: { $exists: true, $ne: 0 } },
      { $unset: { distanceMeters: "" } }
    );
    
    console.log(`Removed distanceMeters field from ${distanceMetersResult.modifiedCount} appointments`);
    
    // Remove blockedTravelWindows field
    const blockedTravelWindowsResult = await AppointmentModel.updateMany(
      { blockedTravelWindows: { $exists: true, $ne: [] } },
      { $unset: { blockedTravelWindows: "" } }
    );
    
    console.log(`Removed blockedTravelWindows field from ${blockedTravelWindowsResult.modifiedCount} appointments`);
    
    console.log('Appointment model migration reverted successfully');
    return {
      success: true,
      weddingPackageDetails: weddingPackageDetailsResult.modifiedCount,
      distanceMeters: distanceMetersResult.modifiedCount,
      blockedTravelWindows: blockedTravelWindowsResult.modifiedCount
    };
  } catch (error) {
    console.error('Error reverting Appointment model migration:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Check migration status
 */
export async function checkMigrationStatus() {
  try {
    // Initialize database connection
    await _db();
    
    // Check a sample of appointments for the new fields
    const sampleAppointment = await AppointmentModel.findOne({});
    
    if (!sampleAppointment) {
      return {
        applied: false,
        message: 'No appointments found in database'
      };
    }
    
    const hasWeddingPackageDetails = 'weddingPackageDetails' in sampleAppointment;
    const hasDistanceMeters = 'distanceMeters' in sampleAppointment;
    const hasBlockedTravelWindows = 'blockedTravelWindows' in sampleAppointment;
    
    const applied = hasWeddingPackageDetails && hasDistanceMeters && hasBlockedTravelWindows;
    
    return {
      applied,
      hasWeddingPackageDetails,
      hasDistanceMeters,
      hasBlockedTravelWindows,
      message: applied 
        ? 'Migration has been applied' 
        : 'Migration has not been applied yet'
    };
  } catch (error) {
    console.error('Error checking migration status:', error);
    return {
      applied: false,
      error: error.message
    };
  }
}

// Run migration if script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  applyAppointmentMigration()
    .then(result => {
      console.log('Migration result:', result);
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}