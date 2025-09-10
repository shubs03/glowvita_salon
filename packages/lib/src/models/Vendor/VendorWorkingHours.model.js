import mongoose from "mongoose";

const workingDaySchema = new mongoose.Schema(
  {
    isOpen: {
      type: Boolean,
      default: true,
    },
    hours: [
      {
        openTime: {
          type: String,
          required: true,
          trim: true,
          match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](AM|PM)$/i,
          default: '09:00AM'
        },
        closeTime: {
          type: String,
          required: true,
          trim: true,
          match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](AM|PM)$/i,
          default: '06:00PM'
        }
      }
    ]
  },
  { _id: false }
);

const vendorWorkingHoursSchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
      unique: true,
      index: true,
    },
    hrs_vid: {
      type: Number,
      required: true,
      unique: true,
      default: () => Date.now(),
    },
    timezone: {
      type: String,
      required: true,
      default: 'Asia/Kolkata',
      trim: true,
    },
    // Standard working hours for each day
    workingHours: {
      monday: {
        ...workingDaySchema.obj,
        hours: [{
          openTime: { type: String, default: '09:00AM' },
          closeTime: { type: String, default: '06:00PM' }
        }]
      },
      tuesday: {
        ...workingDaySchema.obj,
        hours: [{
          openTime: { type: String, default: '09:00AM' },
          closeTime: { type: String, default: '06:00PM' }
        }]
      },
      wednesday: {
        ...workingDaySchema.obj,
        hours: [{
          openTime: { type: String, default: '09:00AM' },
          closeTime: { type: String, default: '06:00PM' }
        }]
      },
      thursday: {
        ...workingDaySchema.obj,
        hours: [{
          openTime: { type: String, default: '09:00AM' },
          closeTime: { type: String, default: '06:00PM' }
        }]
      },
      friday: {
        ...workingDaySchema.obj,
        hours: [{
          openTime: { type: String, default: '09:00AM' },
          closeTime: { type: String, default: '06:00PM' }
        }]
      },
      saturday: {
        ...workingDaySchema.obj,
        isOpen: { type: Boolean, default: false },
        hours: [{
          openTime: { type: String, default: '09:00AM' },
          closeTime: { type: String, default: '06:00PM' }
        }]
      },
      sunday: {
        ...workingDaySchema.obj,
        isOpen: { type: Boolean, default: false },
        hours: []
      }
    },
    // Special working hours for specific dates
    specialHours: [
      {
        date: { type: Date, required: true },
        isOpen: { type: Boolean, default: true },
        hours: [{
          openTime: { type: String, required: true },
          closeTime: { type: String, required: true }
        }],
        description: { type: String, trim: true, maxlength: 100 },
        _id: false
      }
    ],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Indexes for optimized querying
vendorWorkingHoursSchema.index({ vendor: 1 });
vendorWorkingHoursSchema.index({ hrs_vid: 1 });
vendorWorkingHoursSchema.index({ "specialHours.date": 1 });
vendorWorkingHoursSchema.index({ createdAt: -1 });
vendorWorkingHoursSchema.index({ updatedAt: -1 });

// Pre-save hook to update `updatedAt` timestamp
vendorWorkingHoursSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

// Pre-save hook to enforce document size limit
vendorWorkingHoursSchema.pre("save", function (next) {
  const docSize = Buffer.byteLength(JSON.stringify(this), "utf8");
  if (docSize > 16 * 1024 * 1024) {
    return next(new Error("Document size exceeds MongoDB's 16MB limit."));
  }
  next();
});

// Static method for retrieving working hours by vendor
vendorWorkingHoursSchema.statics.getWorkingHoursByVendor = async function (vendorId, date = null) {
  const matchStage = { vendor: new mongoose.Types.ObjectId(vendorId) };
  
  const pipeline = [
    { $match: matchStage },
    {
      $project: {
        vendor: 1,
        hrs_vid: 1,
        timezone: 1,
        workingDays: 1,
        specialHours: {
          $filter: {
            input: "$specialHours",
            as: "specialHour",
            cond: date 
              ? { $eq: [{ $dateToString: { date: "$$specialHour.date", format: "%Y-%m-%d" } }, date] }
              : { $gte: ["$$specialHour.date", new Date()] }
          }
        },
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ];

  return this.aggregate(pipeline).exec();
};

// Method to check if vendor is open at a specific date and time
vendorWorkingHoursSchema.methods.isVendorOpen = function (dateTime) {
  const targetDate = new Date(dateTime);
  const dayOfWeek = targetDate.toLocaleString('en-US', { weekday: 'lowercase' });
  const targetTime = targetDate.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit', 
    hour12: true 
  });

  // Check special hours first
  const specialDay = this.specialHours.find(sh => {
    const shDate = new Date(sh.date);
    return shDate.toDateString() === targetDate.toDateString();
  });

  if (specialDay) {
    if (!specialDay.isOpen) return false;
    return specialDay.hours.some(hour => 
      this.isTimeInRange(targetTime, hour.openTime, hour.closeTime)
    );
  }

  // Check regular working hours
  const workingDay = this.workingHours[dayOfWeek];
  if (!workingDay || !workingDay.isOpen || !workingDay.hours.length) return false;

  return workingDay.hours.some(hour => 
    this.isTimeInRange(targetTime, hour.openTime, hour.closeTime)
  );
};

// Helper method to check if a time is within a range
vendorWorkingHoursSchema.methods.isTimeInRange = function (time, start, end) {
  const parseTime = (t) => {
    const [timePart, modifier] = t.split(/([AP]M)/);
    let [hours, minutes] = timePart.split(':').map(Number);
    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes; // Convert to minutes for comparison
  };

  const target = parseTime(time);
  const startTime = parseTime(start);
  const endTime = parseTime(end);

  return target >= startTime && target <= endTime;
};

const VendorWorkingHoursModel =
  mongoose.models.VendorWorkingHours ||
  mongoose.model("VendorWorkingHours", vendorWorkingHoursSchema);

export default VendorWorkingHoursModel;