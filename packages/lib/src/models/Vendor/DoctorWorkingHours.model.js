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

const doctorWorkingHoursSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
      unique: true,
    },
    hrs_did: {
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

// Indexes for optimized querying
doctorWorkingHoursSchema.index({ "specialHours.date": 1 });
doctorWorkingHoursSchema.index({ createdAt: -1 });
doctorWorkingHoursSchema.index({ updatedAt: -1 });

// Pre-save hook to update `updatedAt` timestamp
doctorWorkingHoursSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

// Pre-save hook to enforce document size limit
doctorWorkingHoursSchema.pre("save", function (next) {
  const docSize = Buffer.byteLength(JSON.stringify(this), "utf8");
  if (docSize > 16 * 1024 * 1024) {
    return next(new Error("Document size exceeds MongoDB's 16MB limit."));
  }
  next();
});

// Static method for retrieving working hours by doctor
doctorWorkingHoursSchema.statics.getWorkingHoursByDoctor = async function (doctorId, date = null) {
  const matchStage = { doctor: new mongoose.Types.ObjectId(doctorId) };
  
  const pipeline = [
    { $match: matchStage },
    {
      $project: {
        doctor: 1,
        hrs_did: 1,
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

// Method to check if doctor is available at a specific date and time
doctorWorkingHoursSchema.methods.isDoctorAvailable = function (dateTime) {
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
doctorWorkingHoursSchema.methods.isTimeInRange = function (time, start, end) {
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

// Helper method to convert 12-hour format to minutes
doctorWorkingHoursSchema.statics.timeToMinutes = function (timeStr) {
  const [timePart, modifier] = timeStr.split(/([AP]M)/);
  let [hours, minutes] = timePart.split(':').map(Number);
  
  if (modifier === 'PM' && hours < 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;
  
  return hours * 60 + minutes;
};

// Method to get doctor working hours for a specific day
doctorWorkingHoursSchema.statics.getDoctorHoursForDay = async function (doctorId, day) {
  const doctorHours = await this.findOne({ doctor: doctorId });
  
  if (!doctorHours) {
    return null;
  }
  
  const dayHours = doctorHours.workingHours[day.toLowerCase()];
  
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

const DoctorWorkingHours = mongoose.models.DoctorWorkingHours || mongoose.model("DoctorWorkingHours", doctorWorkingHoursSchema);

export default DoctorWorkingHours;
