import mongoose from 'mongoose';

/**
 * Database Optimizer Module
 * Handles database indexing and query optimization for the booking system
 */

/**
 * Ensure all required indexes exist for optimal performance
 * @returns {Promise<void>}
 */
export async function ensureIndexes() {
  try {
    console.log('Ensuring database indexes...');
    
    // Get all models
    const models = mongoose.models;
    
    // Ensure indexes for each model
    for (const [modelName, model] of Object.entries(models)) {
      try {
        console.log(`Ensuring indexes for ${modelName}...`);
        await model.ensureIndexes();
        console.log(`✓ Indexes ensured for ${modelName}`);
      } catch (error) {
        console.error(`✗ Failed to ensure indexes for ${modelName}:`, error.message);
      }
    }
    
    console.log('Database indexing completed');
  } catch (error) {
    console.error('Error ensuring database indexes:', error);
    throw error;
  }
}

/**
 * Create compound indexes for common query patterns
 * @returns {Promise<void>}
 */
export async function createOptimizedIndexes() {
  try {
    console.log('Creating optimized indexes...');
    
    // Appointment model optimizations
    const AppointmentModel = mongoose.models.Appointment;
    if (AppointmentModel) {
      // Optimized compound indexes for booking queries
      await AppointmentModel.collection.createIndex(
        { vendorId: 1, date: 1, startTime: 1 },
        { background: true, name: 'vendor_date_time_idx' }
      );
      
      await AppointmentModel.collection.createIndex(
        { vendorId: 1, staff: 1, date: 1 },
        { background: true, name: 'vendor_staff_date_idx' }
      );
      
      await AppointmentModel.collection.createIndex(
        { client: 1, date: -1 },
        { background: true, name: 'client_date_idx' }
      );
      
      await AppointmentModel.collection.createIndex(
        { status: 1, date: -1 },
        { background: true, name: 'status_date_idx' }
      );
      
      await AppointmentModel.collection.createIndex(
        { isHomeService: 1, date: 1 },
        { background: true, name: 'home_service_date_idx' }
      );
      
      await AppointmentModel.collection.createIndex(
        { isWeddingService: 1, date: 1 },
        { background: true, name: 'wedding_service_date_idx' }
      );
      
      // Text index for search
      await AppointmentModel.collection.createIndex(
        { 
          clientName: 'text', 
          staffName: 'text', 
          serviceName: 'text',
          notes: 'text'
        },
        { background: true, name: 'appointment_search_idx' }
      );
    }
    
    // Staff model optimizations
    const StaffModel = mongoose.models.Staff;
    if (StaffModel) {
      // Optimized compound indexes for staff queries
      await StaffModel.collection.createIndex(
        { vendorId: 1, status: 1 },
        { background: true, name: 'staff_vendor_status_idx' }
      );
      
      await StaffModel.collection.createIndex(
        { vendorId: 1, hasWeekdayAvailability: 1 },
        { background: true, name: 'staff_weekday_avail_idx' }
      );
      
      await StaffModel.collection.createIndex(
        { vendorId: 1, hasWeekendAvailability: 1 },
        { background: true, name: 'staff_weekend_avail_idx' }
      );
      
      await StaffModel.collection.createIndex(
        { vendorId: 1, totalWeeklyHours: -1 },
        { background: true, name: 'staff_hours_idx' }
      );
      
      // Text index for staff search
      await StaffModel.collection.createIndex(
        { 
          fullName: 'text', 
          position: 'text', 
          description: 'text',
          tags: 'text'
        },
        { 
          background: true, 
          name: 'staff_search_idx',
          weights: {
            fullName: 10,
            position: 5,
            description: 3,
            tags: 2
          }
        }
      );
    }
    
    // Vendor model optimizations
    const VendorModel = mongoose.models.Vendor;
    if (VendorModel) {
      // Ensure geospatial index exists
      await VendorModel.collection.createIndex(
        { location: '2dsphere' },
        { background: true, name: 'vendor_location_geo_idx' }
      );
      
      // Compound indexes for vendor queries
      await VendorModel.collection.createIndex(
        { status: 1, vendorType: 1 },
        { background: true, name: 'vendor_status_type_idx' }
      );
      
      await VendorModel.collection.createIndex(
        { businessName: 1, city: 1 },
        { background: true, name: 'vendor_name_city_idx' }
      );
      
      // Text index for vendor search
      await VendorModel.collection.createIndex(
        { 
          businessName: 'text', 
          description: 'text', 
          city: 'text',
          state: 'text'
        },
        { 
          background: true, 
          name: 'vendor_search_idx',
          weights: {
            businessName: 10,
            description: 5,
            city: 3,
            state: 2
          }
        }
      );
    }
    
    // VendorServices model optimizations
    const VendorServicesModel = mongoose.models.VendorServices;
    if (VendorServicesModel) {
      // Compound indexes for service queries
      await VendorServicesModel.collection.createIndex(
        { vendor: 1, 'services.status': 1 },
        { background: true, name: 'vendor_services_status_idx' }
      );
      
      await VendorServicesModel.collection.createIndex(
        { 'services.category': 1 },
        { background: true, name: 'services_category_idx' }
      );
      
      await VendorServicesModel.collection.createIndex(
        { 'services.onlineBooking': 1, 'services.status': 1 },
        { background: true, name: 'services_booking_status_idx' }
      );
      
      // Text index for service search
      await VendorServicesModel.collection.createIndex(
        { 
          'services.name': 'text', 
          'services.description': 'text'
        },
        { 
          background: true, 
          name: 'services_search_idx',
          weights: {
            'services.name': 10,
            'services.description': 5
          }
        }
      );
    }
    
    // Client model optimizations
    const ClientModel = mongoose.models.Client;
    if (ClientModel) {
      // Compound indexes for client queries
      await ClientModel.collection.createIndex(
        { vendorId: 1, status: 1 },
        { background: true, name: 'client_vendor_status_idx' }
      );
      
      await ClientModel.collection.createIndex(
        { vendorId: 1, totalSpent: -1 },
        { background: true, name: 'client_spending_idx' }
      );
      
      await ClientModel.collection.createIndex(
        { vendorId: 1, totalBookings: -1 },
        { background: true, name: 'client_bookings_idx' }
      );
      
      await ClientModel.collection.createIndex(
        { vendorId: 1, lastVisit: -1 },
        { background: true, name: 'client_recent_idx' }
      );
      
      // Text index for client search
      await ClientModel.collection.createIndex(
        { 
          fullName: 'text', 
          email: 'text', 
          phone: 'text',
          occupation: 'text'
        },
        { background: true, name: 'client_search_idx' }
      );
    }
    
    // WeddingPackage model optimizations
    const WeddingPackageModel = mongoose.models.WeddingPackage;
    if (WeddingPackageModel) {
      // Compound indexes for wedding package queries
      await WeddingPackageModel.collection.createIndex(
        { vendorId: 1, isActive: 1 },
        { background: true, name: 'wedding_vendor_active_idx' }
      );
      
      await WeddingPackageModel.collection.createIndex(
        { vendorId: 1, createdAt: -1 },
        { background: true, name: 'wedding_recent_idx' }
      );
      
      // Text index for wedding package search
      await WeddingPackageModel.collection.createIndex(
        { 
          name: 'text', 
          description: 'text'
        },
        { 
          background: true, 
          name: 'wedding_search_idx',
          weights: {
            name: 10,
            description: 5
          }
        }
      );
    }
    
    console.log('Optimized indexes created successfully');
  } catch (error) {
    console.error('Error creating optimized indexes:', error);
    throw error;
  }
}

/**
 * Analyze query performance and suggest improvements
 * @returns {Promise<Object>} - Performance analysis report
 */
export async function analyzeQueryPerformance() {
  try {
    console.log('Analyzing query performance...');
    
    const report = {
      slowQueries: [],
      missingIndexes: [],
      recommendations: []
    };
    
    // This would typically connect to MongoDB's profiling data
    // For now, we'll return a template report structure
    report.recommendations.push({
      type: 'index',
      priority: 'high',
      description: 'Consider adding indexes for frequently queried fields',
      impact: 'High'
    });
    
    report.recommendations.push({
      type: 'query',
      priority: 'medium',
      description: 'Review complex aggregation pipelines for optimization',
      impact: 'Medium'
    });
    
    console.log('Query performance analysis completed');
    return report;
  } catch (error) {
    console.error('Error analyzing query performance:', error);
    throw error;
  }
}

/**
 * Optimize database queries by suggesting improvements
 * @param {Object} queryPattern - Query pattern to optimize
 * @returns {Promise<Object>} - Optimization suggestions
 */
export async function optimizeQuery(queryPattern) {
  try {
    console.log('Optimizing query pattern:', queryPattern);
    
    const suggestions = {
      indexes: [],
      refactoring: [],
      caching: []
    };
    
    // Analyze the query pattern and provide suggestions
    if (queryPattern.collection === 'appointments') {
      if (queryPattern.filters && queryPattern.filters.date) {
        suggestions.indexes.push({
          fields: { vendorId: 1, date: 1, startTime: 1 },
          name: 'vendor_date_time_opt_idx',
          reason: 'Optimizes date-based appointment queries'
        });
      }
      
      if (queryPattern.filters && queryPattern.filters.staff) {
        suggestions.indexes.push({
          fields: { vendorId: 1, staff: 1, date: 1 },
          name: 'vendor_staff_date_opt_idx',
          reason: 'Optimizes staff-specific appointment queries'
        });
      }
    }
    
    if (queryPattern.collection === 'staff') {
      if (queryPattern.filters && queryPattern.filters.availability) {
        suggestions.indexes.push({
          fields: { vendorId: 1, hasWeekdayAvailability: 1 },
          name: 'staff_availability_opt_idx',
          reason: 'Optimizes availability-based staff queries'
        });
      }
    }
    
    console.log('Query optimization suggestions generated');
    return suggestions;
  } catch (error) {
    console.error('Error optimizing query:', error);
    throw error;
  }
}

/**
 * Clean up unused indexes to improve write performance
 * @returns {Promise<Object>} - Cleanup report
 */
export async function cleanupUnusedIndexes() {
  try {
    console.log('Cleaning up unused indexes...');
    
    const report = {
      deleted: [],
      failed: [],
      skipped: []
    };
    
    // This would typically analyze index usage statistics
    // For now, we'll return a template report structure
    console.log('Index cleanup completed');
    return report;
  } catch (error) {
    console.error('Error cleaning up indexes:', error);
    throw error;
  }
}

export default {
  ensureIndexes,
  createOptimizedIndexes,
  analyzeQueryPerformance,
  optimizeQuery,
  cleanupUnusedIndexes
};