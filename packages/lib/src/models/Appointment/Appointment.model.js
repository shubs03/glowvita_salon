import mongoose from "mongoose";
import ServiceModel from "../admin/Service.model.js";
import StaffModel from "../Vendor/Staff.model.js";

// Ensure the Service and Staff models are registered
const Service = mongoose.models.Service || ServiceModel;
const Staff = mongoose.models.Staff || StaffModel;

// Schema for individual service items in a multi-service appointment
const serviceItemSchema = new mongoose.Schema({
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Service",
    required: true,
  },
  serviceName: {
    type: String,
    required: true,
  },
  staff: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Staff",
    required: false, // Allow null for "Any Professional"
  },
  staffName: {
    type: String,
    required: true,
  },
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  // Additional fields for enhanced booking
  travelTime: {
    type: Number, // in minutes
    default: 0,
  },
  travelDistance: {
    type: Number, // in kilometers
    default: 0,
  },
  distanceMeters: {
    type: Number, // in meters
    default: 0,
  },
  prepTime: {
    type: Number, // in minutes
    default: 0,
  },
  setupCleanupTime: {
    type: Number, // in minutes
    default: 0,
  },
});

const appointmentSchema = new mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
    },
    // For backward compatibility, keep the main staff/service fields
    // For multi-service appointments, these will represent the primary service
    staff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
      required: false, // Changed to false to allow null values for "Any Professional"
    },
    staffName: {
      type: String,
      required: true,
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    serviceName: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    clientName: {
      type: String,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    // Payment-related fields
    platformFee: {
      type: Number,
      default: 0,
    },
    serviceTax: {
      type: Number,
      default: 0,
    },
    taxRate: {
      type: Number,
      default: 0,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    finalAmount: {
      type: Number,
      required: true,
    },
    // Fields to track payment progress
    amountPaid: {
      type: Number,
      default: 0,
    },
    amountRemaining: {
      type: Number,
      default: function () {
        return this.finalAmount || this.totalAmount || 0;
      },
    },
    paymentMethod: {
      type: String,
      enum: ["Pay at Salon", "Pay Online", "Pay Later"],
      default: "Pay at Salon",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "partial", "completed", "failed", "refunded"],
      default: "pending",
    },
    // History of payment transactions for this appointment
    paymentHistory: {
      type: [
        {
          amount: { type: Number, required: true },
          paymentMethod: { type: String, required: true },
          paymentDate: { type: Date, default: Date.now },
          notes: { type: String, default: "" },
          transactionId: { type: String, default: null },
          paymentCollectionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "PaymentCollection",
            default: null,
          },
        },
      ],
      default: [],
    },
    razorpayOrderId: {
      type: String,
    },
    razorpayPaymentId: {
      type: String,
    },
    razorpaySignature: {
      type: String,
    },
    status: {
      type: String,
      enum: [
        "temp-locked",
        "scheduled",
        "confirmed",
        "completed",
        "partially-completed",
        "cancelled",
        "no-show",
      ],
      default: "scheduled",
    },
    // Fields for optimistic locking
    lockToken: {
      type: String,
    },
    lockExpiration: {
      type: Date,
    },
    notes: {
      type: String,
    },
    // New field for multi-service appointments
    serviceItems: {
      type: [serviceItemSchema],
      default: [],
    },
    // Flag to indicate if this is a multi-service appointment
    isMultiService: {
      type: Boolean,
      default: false,
    },
    // Flag to indicate if this is a home service
    isHomeService: {
      type: Boolean,
      default: false,
    },
    // Home service location details
    homeServiceLocation: {
      address: {
        type: String,
      },
      city: {
        type: String,
      },
      state: {
        type: String,
      },
      pincode: {
        type: String,
      },
      landmark: {
        type: String,
      },
      lat: {
        type: Number,
      },
      lng: {
        type: Number,
      },
    },
    // Flag to indicate if this is a wedding service
    isWeddingService: {
      type: Boolean,
      default: false,
    },
    // Wedding package details for wedding appointments
    weddingPackageDetails: {
      packageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "WeddingPackage",
      },
      packageName: {
        type: String,
      },
      packageServices: [
        {
          serviceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Service",
          },
          serviceName: {
            type: String,
          },
          vendorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Vendor",
          },
          staffId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Staff",
          },
          duration: {
            type: Number,
          },
          amount: {
            type: Number,
          },
        },
      ],
      totalDuration: {
        type: Number,
      },
      totalAmount: {
        type: Number,
      },
    },
    // Travel and scheduling information
    travelTime: {
      type: Number, // in minutes
      default: 0,
    },
    travelDistance: {
      type: Number, // in kilometers
      default: 0,
    },
    distanceMeters: {
      type: Number, // in meters
      default: 0,
    },
    blockingWindows: [
      {
        startTime: {
          type: String,
          required: true,
        },
        endTime: {
          type: String,
          required: true,
        },
        reason: {
          type: String,
          default: "Travel time",
        },
      },
    ],
    // Blocked travel windows for pre and post travel time
    blockedTravelWindows: [
      {
        startTime: {
          type: String,
          required: true,
        },
        endTime: {
          type: String,
          required: true,
        },
        reason: {
          type: String,
          default: "Travel time",
        },
        type: {
          type: String,
          enum: ["pre-travel", "post-travel", "buffer"],
          default: "pre-travel",
        },
      },
    ],
    // Buffer time before and after appointment
    bufferBefore: {
      type: Number, // in minutes
      default: 0,
    },
    bufferAfter: {
        type: Number, // in minutes
        default: 0
    },
    // Booking mode: 'online' for web bookings, 'offline' for CRM bookings
    mode: {
      type: String,
      enum: ["online", "offline"],
      required: true,
      default: "offline",
    },
  },
  {
    timestamps: true,
  }
);

// Optimized indexes for preventing double booking and improving query performance
// Compound index for slot conflict detection (most critical queries)
appointmentSchema.index(
  {
    vendorId: 1,
    staff: 1,
    date: 1,
    startTime: 1,
    endTime: 1,
  },
  { name: "slot_conflict_detection" }
);

// Index for status-based queries
appointmentSchema.index(
  { vendorId: 1, status: 1, date: -1 },
  { name: "vendor_status_queries" }
);

// Index for client history
appointmentSchema.index(
  { client: 1, createdAt: -1 },
  { name: "client_history" }
);

// Index for service-based queries
appointmentSchema.index({ service: 1, date: 1 }, { name: "service_queries" });

// Index for home service filtering
appointmentSchema.index({ isHomeService: 1, vendorId: 1 });

// Index for wedding service filtering
appointmentSchema.index({ isWeddingService: 1, vendorId: 1 });

// Index for wedding package appointments
appointmentSchema.index({ "weddingPackageDetails.packageId": 1 });

// Index for optimistic locking
appointmentSchema.index(
  { lockToken: 1, lockExpiration: 1 },
  {
    name: "optimistic_locking",
    sparse: true, // Only index documents with lockToken
  }
);

// Index for travel blocking windows (home service appointments)
appointmentSchema.index(
  {
    "blockedTravelWindows.startTime": 1,
    "blockedTravelWindows.endTime": 1,
  },
  { sparse: true }
);

// Ensure the model is only defined once
const AppointmentModel =
  mongoose.models.Appointment ||
  mongoose.model("Appointment", appointmentSchema);

export default AppointmentModel;
