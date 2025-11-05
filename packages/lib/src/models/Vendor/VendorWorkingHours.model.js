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
          trim: true,
          default: '09:00AM'
        },
        closeTime: {
          type: String,
          trim: true,
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
      unique: true, // This already creates an index, no need for separate index: true
    },
    hrs_vid: {
      type: Number,
      required: true,
      unique: true, // This already creates an index, no need for separate index: true
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
      monday: workingDaySchema,
      tuesday: workingDaySchema,
      wednesday: workingDaySchema,
      thursday: workingDaySchema,
      friday: workingDaySchema,
      saturday: { ...workingDaySchema.obj, isOpen: { type: Boolean, default: false } },
      sunday: { ...workingDaySchema.obj, isOpen: { type: Boolean, default: false }, hours: { type: [], default: [] } }
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

// Indexes for optimized querying (removed duplicates)
vendorWorkingHoursSchema.index({ "specialHours.date": 1 });
vendorWorkingHoursSchema.index({ createdAt: -1 });
vendorWorkingHoursSchema.index({ updatedAt: -1 });

// Add this helper function to update staff working hours when vendor hours change
vendorWorkingHoursSchema.statics.updateStaffBasedOnVendorHours = async function (vendorId, updatedWorkingHours, previousWorkingHours) {
  try {
    // Dynamically import Staff model to avoid circular dependency
    const { default: Staff } = await import('./Staff.model.js');
    
    // Days of the week
    const dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    // Prepare bulk operations for better performance
    const bulkOps = [];
    
    // For each day, check if there are changes
    for (const day of dayNames) {
      const currentDayHours = updatedWorkingHours[day];
      const previousDayHours = previousWorkingHours ? previousWorkingHours[day] : null;
      
      // Handle case where currentDayHours might be undefined
      if (!currentDayHours) {
        continue;
      }
      
      // Check if the day's availability has changed (isOpen status or hours)
      const dayAvailabilityChanged = 
        !previousDayHours || 
        previousDayHours.isOpen !== currentDayHours.isOpen ||
        JSON.stringify(previousDayHours.hours || []) !== JSON.stringify(currentDayHours.hours || []);
      
      if (dayAvailabilityChanged) {
        const dayAvailableField = `${day}Available`;
        const daySlotsField = `${day}Slots`;
        
        if (!currentDayHours.isOpen) {
          // If vendor is now closed on this day, update all staff to be unavailable
          bulkOps.push({
            updateMany: {
              filter: { vendorId: vendorId },
              update: { 
                $set: { 
                  [dayAvailableField]: false,
                  [daySlotsField]: []
                }
              }
            }
          });
        } else {
          // Vendor is open (either newly opened or hours changed)
          if (currentDayHours.hours && currentDayHours.hours.length > 0) {
            const vendorOpenMinutes = this.timeToMinutes(currentDayHours.hours[0].openTime);
            const vendorCloseMinutes = this.timeToMinutes(currentDayHours.hours[0].closeTime);
            
            // Create staff slots based on vendor hours
            const vendorSlots = [{
              startMinutes: vendorOpenMinutes,
              endMinutes: vendorCloseMinutes,
              startTime: this.convertToDisplayTime(currentDayHours.hours[0].openTime),
              endTime: this.convertToDisplayTime(currentDayHours.hours[0].closeTime)
            }];
            
            bulkOps.push({
              updateMany: {
                filter: { vendorId: vendorId },
                update: { 
                  $set: { 
                    [dayAvailableField]: true,
                    [daySlotsField]: vendorSlots
                  }
                }
              }
            });
          } else {
            // If no vendor hours specified, just set to available
            bulkOps.push({
              updateMany: {
                filter: { vendorId: vendorId },
                update: { 
                  $set: { 
                    [dayAvailableField]: true
                  }
                }
              }
            });
          }
        }
      }
    }
    
    // Execute all updates in a single bulk operation for better performance
    if (bulkOps.length > 0) {
      await Staff.bulkWrite(bulkOps);
    }
  } catch (error) {
    console.error('Error updating staff based on vendor hours:', error);
    throw error;
  }
};

// Helper method to convert 12-hour format to minutes
vendorWorkingHoursSchema.statics.timeToMinutes = function (timeStr) {
  // Handle case where timeStr might be undefined
  if (!timeStr) {
    return 0;
  }
  
  const [timePart, modifier] = timeStr.split(/([AP]M)/);
  let [hours, minutes] = timePart.split(':').map(Number);
  
  if (modifier === 'PM' && hours < 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;
  
  return hours * 60 + minutes;
};

// Helper method to convert 12-hour format to 24-hour format display time
vendorWorkingHoursSchema.statics.convertToDisplayTime = function (timeStr) {
  // Handle case where timeStr might be undefined
  if (!timeStr) {
    return '00:00';
  }
  
  const [timePart, modifier] = timeStr.split(/([AP]M)/);
  let [hours, minutes] = timePart.split(':').map(Number);
  
  if (modifier === 'PM' && hours < 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;
  
  // Format as HH:MM
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

// Pre-save hook to update `updatedAt` timestamp
vendorWorkingHoursSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

// Pre-save hook to capture original working hours for comparison
vendorWorkingHoursSchema.pre("save", function (next) {
  // Capture the original working hours before saving
  if (!this.isNew) {
    // For existing documents, get the current state from database
    this.constructor.findById(this._id).lean().then(originalDoc => {
      if (originalDoc) {
        // Deep clone the working hours to preserve original values
        this.$locals.originalWorkingHours = JSON.parse(JSON.stringify(originalDoc.workingHours));
      } else {
        this.$locals.originalWorkingHours = null;
      }
      next();
    }).catch(err => {
      console.error('Error getting original document:', err);
      this.$locals.originalWorkingHours = null;
      next();
    });
  } else {
    // For new documents, there's no previous state
    this.$locals.originalWorkingHours = null;
    next();
  }
});

// Pre-save hook to enforce document size limit
vendorWorkingHoursSchema.pre("save", function (next) {
  const docSize = Buffer.byteLength(JSON.stringify(this), "utf8");
  if (docSize > 16 * 1024 * 1024) {
    return next(new Error("Document size exceeds MongoDB's 16MB limit."));
  }
  next();
});

// Post-save hook to synchronize staff working hours
vendorWorkingHoursSchema.post("save", async function (doc) {
  try {
    // Skip synchronization if this is a new document
    if (this.isNew) {
      return;
    }
    
    // Use the original working hours captured in the pre-save hook
    const originalWorkingHours = this.$locals.originalWorkingHours;
    
    if (originalWorkingHours) {
      // Compare with current working hours and update staff if needed
      await this.constructor.updateStaffBasedOnVendorHours(
        this.vendor,
        this.workingHours,
        originalWorkingHours
      );
    }
  } catch (error) {
    console.error('Error in post-save hook for VendorWorkingHours:', error);
  }
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

// Method to get vendor working hours for a specific day
vendorWorkingHoursSchema.statics.getVendorHoursForDay = async function (vendorId, day) {
  const vendorHours = await this.findOne({ vendor: vendorId });
  
  if (!vendorHours) {
    return null;
  }
  
  const dayHours = vendorHours.workingHours[day.toLowerCase()];
  
  if (!dayHours || !dayHours.isOpen || !dayHours.hours.length) {
    return null;
  }
  
  // Return the first time slot (assuming single time slot per day)
  return {
    openTime: dayHours.hours[0].openTime,
    closeTime: dayHours.hours[0].closeTime,
    openMinutes: this.timeToMinutes(dayHours.hours[0].openTime),
    closeMinutes: this.timeToMinutes(dayHours.hours[0].closeTime)
  };
};

// Add a method to manually trigger staff synchronization
vendorWorkingHoursSchema.statics.syncStaffWithVendorHours = async function (vendorId) {
  try {
    const vendorHours = await this.findOne({ vendor: vendorId });
    
    if (!vendorHours) {
      throw new Error('Vendor working hours not found');
    }
    
    // For manual sync, we pass null as previousWorkingHours to force update all days
    await this.updateStaffBasedOnVendorHours(vendorId, vendorHours.workingHours, null);
  } catch (error) {
    console.error('Error synchronizing staff with vendor hours:', error);
    throw error;
  }
};

// Add a method to update vendor working hours and automatically sync staff
vendorWorkingHoursSchema.statics.updateVendorHoursAndSyncStaff = async function (vendorId, newWorkingHours) {
  try {
    // Find the existing vendor working hours document
    const vendorHoursDoc = await this.findOne({ vendor: vendorId });
    
    if (!vendorHoursDoc) {
      throw new Error('Vendor working hours not found');
    }
    
    // Save the original working hours for comparison
    const originalWorkingHours = { ...vendorHoursDoc.workingHours };
    
    // Update the vendor working hours
    vendorHoursDoc.workingHours = newWorkingHours;
    await vendorHoursDoc.save();
    
    // The post-save hook will automatically sync staff, but we can also do it explicitly
    await this.updateStaffBasedOnVendorHours(vendorId, newWorkingHours, originalWorkingHours);
    
    return vendorHoursDoc;
  } catch (error) {
    console.error('Error updating vendor hours and syncing staff:', error);
    throw error;
  }
};

const VendorWorkingHoursModel =
  mongoose.models.VendorWorkingHours ||
  mongoose.model("VendorWorkingHours", vendorWorkingHoursSchema);

export default VendorWorkingHoursModel;