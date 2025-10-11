import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const bankDetailsSchema = new mongoose.Schema(
  {
    accountHolderName: { type: String, trim: true, index: true },
    accountNumber: { type: String, trim: true, sparse: true, index: true },
    bankName: { type: String, trim: true },
    ifscCode: { type: String, trim: true, uppercase: true },
    upiId: { type: String, trim: true, lowercase: true },
  },
  { _id: false }
);

// Optimized time slot schema - using minutes from midnight for faster comparisons
const timeSlotSchema = new mongoose.Schema(
  {
    startMinutes: {
      type: Number, // Minutes from midnight (0-1439)
      required: true,
      min: 0,
      max: 1439,
    },
    endMinutes: {
      type: Number, // Minutes from midnight (0-1439)
      required: true,
      min: 0,
      max: 1439,
    },
    startTime: {
      type: String, // Human readable format "HH:MM" for display
      required: true,
    },
    endTime: {
      type: String, // Human readable format "HH:MM" for display
      required: true,
    },
  },
  { _id: false }
);

// Flattened availability schema for better indexing
const staffSchema = new mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
      refPath: 'userType' // Dynamic reference based on userType
    },
    userType: {
      type: String,
      required: true,
      enum: ['Vendor', 'Doctor'],
      default: 'Vendor',
      index: true
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true, // For name-based searches
    },
    position: {
      type: String,
      required: true,
      trim: true,
      index: true, // For filtering by position
    },
    mobileNo: {
      type: String,
      required: true,
      trim: true,
      index: true, // For contact searches
    },
    emailAddress: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true, // For login and search
    },
    photo: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    salary: {
      type: Number,
      default: 0,
      index: true, // For salary range queries
    },
    startDate: {
      type: Date,
      default: null,
      index: true, // For employment duration queries
    },
    endDate: {
      type: Date,
      default: null,
      index: true,
    },
    yearOfExperience: {
      type: Number,
      default: 0,
      index: true, // For experience-based filtering
    },
    clientsServed: {
      type: Number,
      default: 0,
      index: true, // For performance metrics
    },
    commission: {
      type: Boolean,
      default: false,
      index: true,
    },
    bankDetails: {
      type: bankDetailsSchema,
      default: () => ({}),
    },
    password: {
      type: String,
      required: true,
      select: false, // Never select by default for security
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
    role: {
      type: String,
      required: true,
      trim: true,
      default: "staff",
      index: true, // For role-based queries
    },
    permissions: {
      type: [String],
      default: [],
      index: true, // For permission-based filtering
    },
    status: {
      type: String,
      enum: ["Active", "Inactive", "On Leave", "Suspended"],
      default: "Active",
      index: true, // Most common query
    },
    lastLoginAt: {
      type: Date,
      default: null,
      index: true, // For activity tracking
    },

    // OPTIMIZED AVAILABILITY FIELDS - Flattened for better indexing
    // Monday availability
    mondayAvailable: { type: Boolean, default: true, index: true },
    mondaySlots: { type: [timeSlotSchema], default: [] },

    // Tuesday availability
    tuesdayAvailable: { type: Boolean, default: true, index: true },
    tuesdaySlots: { type: [timeSlotSchema], default: [] },

    // Wednesday availability
    wednesdayAvailable: { type: Boolean, default: true, index: true },
    wednesdaySlots: { type: [timeSlotSchema], default: [] },

    // Thursday availability
    thursdayAvailable: { type: Boolean, default: true, index: true },
    thursdaySlots: { type: [timeSlotSchema], default: [] },

    // Friday availability
    fridayAvailable: { type: Boolean, default: true, index: true },
    fridaySlots: { type: [timeSlotSchema], default: [] },

    // Saturday availability
    saturdayAvailable: { type: Boolean, default: true, index: true },
    saturdaySlots: { type: [timeSlotSchema], default: [] },

    // Sunday availability
    sundayAvailable: { type: Boolean, default: true, index: true },
    sundaySlots: { type: [timeSlotSchema], default: [] },

    // Blocked times - optimized structure
    blockedTimes: [
      {
        date: { type: Date, required: true, index: true },
        startMinutes: { type: Number, min: 0, max: 1439 },
        endMinutes: { type: Number, min: 0, max: 1439 },
        startTime: { type: String, required: true },
        endTime: { type: String, required: true },
        reason: { type: String, trim: true, default: "" },
        isRecurring: { type: Boolean, default: false, index: true },
        recurringType: {
          type: String,
          enum: ["weekly", "monthly", "yearly"],
          default: null,
        },
        isActive: { type: Boolean, default: true, index: true }, // Soft delete
      },
    ],

    timezone: {
      type: String,
      default: "UTC",
      trim: true,
      index: true,
    },

    // Performance optimization fields
    isCurrentlyAvailable: { type: Boolean, default: true, index: true }, // Real-time status
    nextAvailableSlot: { type: Date, index: true }, // Cached next availability
    avgResponseTime: { type: Number, default: 0 }, // Performance metric
    rating: { type: Number, default: 0, min: 0, max: 5, index: true },
    totalRatings: { type: Number, default: 0 },

    // Search optimization
    searchText: { type: String, index: "text" }, // Full-text search
    tags: { type: [String], index: true }, // For categorization

    // Caching fields for complex calculations
    lastAvailabilityUpdate: { type: Date, default: Date.now },
    availabilityHash: { type: String }, // For change detection
  },
  {
    timestamps: true,
    // Optimize for read operations
    read: "secondaryPreferred",
  }
);

// Pre-save hook to validate staff working hours against vendor hours
staffSchema.pre("save", async function (next) {
  try {
    // Only validate if working hours slots are being modified
    const dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    let needsValidation = false;
    
    for (const day of dayNames) {
      const dayField = `${day}Slots`;
      if (this.isModified(dayField) && this[dayField] && this[dayField].length > 0) {
        needsValidation = true;
        break;
      }
    }
    
    if (needsValidation) {
      // Dynamically import VendorWorkingHours to avoid circular dependency
      const { default: VendorWorkingHours } = await import('./VendorWorkingHours.model.js');
      
      for (const day of dayNames) {
        const dayAvailableField = `${day}Available`;
        const dayField = `${day}Slots`;
        
        // Only validate if the day is available and has slots defined
        if (this[dayAvailableField] && this[dayField] && this[dayField].length > 0) {
          // Get vendor working hours for the specific day
          const vendorHours = await VendorWorkingHours.getVendorHoursForDay(this.vendorId, day);
          
          // If vendor is closed on this day, staff cannot work
          if (!vendorHours) {
            return next(new Error(`Vendor is closed on ${day}. Staff cannot be scheduled.`));
          }
          
          // Validate each staff slot
          for (const slot of this[dayField]) {
            const staffStartMinutes = this.constructor.timeToMinutes(slot.startTime);
            const staffEndMinutes = this.constructor.timeToMinutes(slot.endTime);
            
            // Check if staff hours are within vendor hours
            if (staffStartMinutes < vendorHours.openMinutes || staffEndMinutes > vendorHours.closeMinutes) {
              return next(new Error(`Staff working hours must be within vendor hours (${vendorHours.openTime} - ${vendorHours.closeTime}) on ${day}`));
            }
            
            // Check if staff start time is before end time
            if (staffStartMinutes >= staffEndMinutes) {
              return next(new Error(`Staff start time must be before end time on ${day}`));
            }
          }
        }
      }
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

// COMPOUND INDEXES for common query patterns
staffSchema.index({ vendorId: 1, status: 1, role: 1 }); // Most common filter
staffSchema.index({ vendorId: 1, emailAddress: 1 }, { unique: true }); // Login
staffSchema.index({ vendorId: 1, mobileNo: 1 }, { unique: true }); // Contact uniqueness

// Availability-specific compound indexes
staffSchema.index({
  vendorId: 1,
  status: 1,
  mondayAvailable: 1,
  tuesdayAvailable: 1,
  wednesdayAvailable: 1,
  thursdayAvailable: 1,
  fridayAvailable: 1,
  saturdayAvailable: 1,
  sundayAvailable: 1,
}); // Weekly availability lookup

staffSchema.index({ vendorId: 1, hasWeekdayAvailability: 1 }); // Weekday staff
staffSchema.index({ vendorId: 1, hasWeekendAvailability: 1 }); // Weekend staff
staffSchema.index({
  vendorId: 1,
  isCurrentlyAvailable: 1,
  nextAvailableSlot: 1,
}); // Real-time availability

// Blocked times indexes
staffSchema.index({ "blockedTimes.date": 1, "blockedTimes.isActive": 1 });
staffSchema.index({
  "blockedTimes.isRecurring": 1,
  "blockedTimes.recurringType": 1,
});

// Performance indexes
staffSchema.index({ vendorId: 1, rating: -1, totalRatings: -1 }); // Top performers
staffSchema.index({ vendorId: 1, position: 1, yearOfExperience: -1 }); // Experience-based

// Full-text search index
staffSchema.index({
  fullName: "text",
  position: "text",
  description: "text",
  tags: "text",
});

// OPTIMIZED HELPER METHODS

// Convert time string to minutes for faster comparisons
staffSchema.statics.timeToMinutes = function (timeStr) {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
};

// Convert minutes back to time string
staffSchema.statics.minutesToTime = function (minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
};

// Optimized availability check
staffSchema.methods.isAvailableAt = function (date, timeStr) {
  const dayNames = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  const dayName = dayNames[date.getDay()];
  const dayField = `${dayName}Available`;
  const slotsField = `${dayName}Slots`;

  // Quick availability check
  if (!this[dayField]) return false;

  const timeMinutes = this.constructor.timeToMinutes(timeStr);

  // Check time slots if they exist
  if (this[slotsField].length > 0) {
    const isInSlot = this[slotsField].some(
      (slot) =>
        timeMinutes >= slot.startMinutes && timeMinutes <= slot.endMinutes
    );
    return isInSlot;
  }

  // If no slots defined, assume available during business hours
  return true;
};

// Check if time slot is blocked
staffSchema.methods.isBlockedAt = function (date, timeStr) {
  if (!this.blockedTimes || this.blockedTimes.length === 0) {
    return false;
  }

  const timeMinutes = this.constructor.timeToMinutes(timeStr);
  const dateString = date.toISOString().split('T')[0];

  return this.blockedTimes.some(blocked => {
    const blockedDateString = blocked.date.toISOString().split('T')[0];
    return (
      blockedDateString === dateString &&
      timeMinutes >= blocked.startMinutes &&
      timeMinutes < blocked.endMinutes
    );
  });
};

// Static methods for optimized queries
staffSchema.statics.findAvailableStaff = function (
  vendorId,
  day,
  timeSlot,
  options = {}
) {
  const dayField = `${day.toLowerCase()}Available`;
  const query = {
    vendorId,
    status: "Active",
    [dayField]: true,
  };

  if (options.position) query.position = options.position;
  if (options.minExperience)
    query.yearOfExperience = { $gte: options.minExperience };
  if (options.minRating) query.rating = { $gte: options.minRating };

  return this.find(query)
    .select(
      "fullName position yearOfExperience rating " +
        dayField +
        " " +
        day.toLowerCase() +
        "Slots blockedTimes"
    )
    .sort({ rating: -1, yearOfExperience: -1 })
    .limit(options.limit || 50);
};

staffSchema.statics.findByAvailabilityPattern = function (vendorId, pattern) {
  const query = { vendorId, status: "Active" };

  if (pattern.weekdaysOnly) query.hasWeekdayAvailability = true;
  if (pattern.weekendsOnly) query.hasWeekendAvailability = true;
  if (pattern.minHours) query.totalWeeklyHours = { $gte: pattern.minHours };

  return this.find(query);
};

const StaffModel =
  mongoose.models.Staff || mongoose.model("Staff", staffSchema);

export default StaffModel;