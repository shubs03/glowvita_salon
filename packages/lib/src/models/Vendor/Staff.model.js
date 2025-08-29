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
      ref: "Vendor",
      required: true,
      index: true,
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

    // Aggregate availability flags for faster queries
    hasWeekdayAvailability: { type: Boolean, default: true, index: true },
    hasWeekendAvailability: { type: Boolean, default: true, index: true },
    totalWeeklyHours: { type: Number, default: 0, index: true },

    // Blocked times - optimized structure
    blockedTimes: [
      {
        date: { type: Date, required: true, index: true },
        startMinutes: { type: Number, required: true, min: 0, max: 1439 },
        endMinutes: { type: Number, required: true, min: 0, max: 1439 },
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
    if (!isInSlot) return false;
  }

  // Check blocked times (optimized)
  const dateStr = date.toISOString().split("T")[0];
  const isBlocked = this.blockedTimes.some(
    (blocked) =>
      blocked.isActive &&
      blocked.date.toISOString().split("T")[0] === dateStr &&
      timeMinutes >= blocked.startMinutes &&
      timeMinutes <= blocked.endMinutes
  );

  return !isBlocked;
};

// Batch availability check for multiple time slots
staffSchema.methods.getAvailableSlots = function (date, requestedSlots = []) {
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

  if (!this[dayField]) return [];

  let availableSlots = this[slotsField].slice();

  // Filter blocked times efficiently
  const dateStr = date.toISOString().split("T")[0];
  const blockedForDay = this.blockedTimes.filter(
    (blocked) =>
      blocked.isActive && blocked.date.toISOString().split("T")[0] === dateStr
  );

  if (blockedForDay.length === 0) return availableSlots;

  // Remove blocked slots
  return availableSlots.filter(
    (slot) =>
      !blockedForDay.some(
        (blocked) =>
          !(
            slot.endMinutes <= blocked.startMinutes ||
            slot.startMinutes >= blocked.endMinutes
          )
      )
  );
};

// Update aggregate fields for optimization
staffSchema.methods.updateAvailabilityCache = function () {
  this.hasWeekdayAvailability =
    this.mondayAvailable ||
    this.tuesdayAvailable ||
    this.wednesdayAvailable ||
    this.thursdayAvailable ||
    this.fridayAvailable;

  this.hasWeekendAvailability = this.saturdayAvailable || this.sundayAvailable;

  // Calculate total weekly hours
  const daySlots = [
    "mondaySlots",
    "tuesdaySlots",
    "wednesdaySlots",
    "thursdaySlots",
    "fridaySlots",
    "saturdaySlots",
    "sundaySlots",
  ];

  this.totalWeeklyHours = daySlots.reduce((total, daySlot) => {
    return (
      total +
      this[daySlot].reduce((dayTotal, slot) => {
        return dayTotal + (slot.endMinutes - slot.startMinutes) / 60;
      }, 0)
    );
  }, 0);

  this.lastAvailabilityUpdate = new Date();

  // Update search text for full-text search
  this.searchText = `${this.fullName} ${this.position} ${this.description} ${this.tags.join(" ")}`;
};

// Pre-save middleware to optimize data
staffSchema.pre("save", function (next) {
  // Convert time strings to minutes for time slots
  const daySlots = [
    "mondaySlots",
    "tuesdaySlots",
    "wednesdaySlots",
    "thursdaySlots",
    "fridaySlots",
    "saturdaySlots",
    "sundaySlots",
  ];

  daySlots.forEach((daySlot) => {
    this[daySlot].forEach((slot) => {
      if (!slot.startMinutes)
        slot.startMinutes = this.constructor.timeToMinutes(slot.startTime);
      if (!slot.endMinutes)
        slot.endMinutes = this.constructor.timeToMinutes(slot.endTime);
    });
  });

  // Convert blocked times
  this.blockedTimes.forEach((blocked) => {
    if (!blocked.startMinutes)
      blocked.startMinutes = this.constructor.timeToMinutes(blocked.startTime);
    if (!blocked.endMinutes)
      blocked.endMinutes = this.constructor.timeToMinutes(blocked.endTime);
  });

  // Update cache fields
  this.updateAvailabilityCache();

  next();
});

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
        "Slots"
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
