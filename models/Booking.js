const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    // Customer Information
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true
    },
    customerName: {
      type: String,
      required: true
    },
    customerEmail: {
      type: String,
      required: true
    },
    customerPhone: {
      type: String,
      required: true
    },

    // Hotel Information
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
      required: true
    },
    hotelName: {
      type: String,
      required: true
    },
    hotelAddress: {
      type: String,
      required: true
    },
    hotelCity: {
      type: String,
      required: true
    },

    // Room Information
    roomType: {
      type: String,
      required: true
    },
    numberOfRooms: {
      type: Number,
      required: true,
      min: 1,
      default: 1
    },
    maxGuests: {
      type: Number,
      required: true
    },
    pricePerNight: {
      type: Number,
      required: true
    },

    // Booking Dates
    checkInDate: {
      type: Date,
      required: true
    },
    checkOutDate: {
      type: Date,
      required: true
    },
    numberOfNights: {
      type: Number,
      required: true
    },

    // Guest Information
    numberOfGuests: {
      type: Number,
      required: true,
      min: 1
    },
    guestDetails: {
      adults: {
        type: Number,
        required: true,
        min: 1
      },
      children: {
        type: Number,
        default: 0,
        min: 0
      }
    },

    // Payment Information
    totalAmount: {
      type: Number,
      required: true
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending"
    },
    paymentMethod: {
      type: String,
      enum: ["credit_card", "debit_card", "upi", "net_banking", "cash"],
      default: "credit_card"
    },
    transactionId: {
      type: String,
      sparse: true
    },

    // Booking Status
    bookingStatus: {
      type: String,
      enum: ["confirmed", "pending", "cancelled", "completed", "no-show"],
      default: "pending"
    },
    bookingReference: {
      type: String,
      unique: true
    },

    // Special Requests
    specialRequests: {
      type: String,
      maxlength: 500
    },

    // Cancellation
    cancellationReason: {
      type: String
    },
    cancelledAt: {
      type: Date
    },
    cancelledBy: {
      type: String,
      enum: ["customer", "hotel", "admin"]
    },

    // Additional Information
    arrivalTime: {
      type: String
    },
    isPetFriendly: {
      type: Boolean,
      default: false
    },
    notes: {
      type: String,
      maxlength: 1000
    }
  },
  {
    timestamps: true
  }
);

// Indexes for better query performance
bookingSchema.index({ customer: 1, createdAt: -1 });
bookingSchema.index({ hotel: 1, checkInDate: 1 });
bookingSchema.index({ bookingReference: 1 });
bookingSchema.index({ bookingStatus: 1 });
bookingSchema.index({ checkInDate: 1, checkOutDate: 1 });

// Generate unique booking reference before saving
bookingSchema.pre("save", function(next) {
  if (!this.bookingReference) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.bookingReference = `BK${timestamp}${randomStr}`;
  }
  next();
});

// Calculate number of nights
bookingSchema.pre("save", function(next) {
  if (this.checkInDate && this.checkOutDate) {
    const timeDiff = this.checkOutDate.getTime() - this.checkInDate.getTime();
    this.numberOfNights = Math.ceil(timeDiff / (1000 * 3600 * 24));
  }
  next();
});

// Virtual for booking duration in human readable format
bookingSchema.virtual("duration").get(function() {
  return `${this.numberOfNights} ${this.numberOfNights === 1 ? "night" : "nights"}`;
});

// Method to check if booking is active
bookingSchema.methods.isActive = function() {
  return this.bookingStatus === "confirmed" && new Date() < this.checkOutDate;
};

// Method to check if booking is upcoming
bookingSchema.methods.isUpcoming = function() {
  return this.bookingStatus === "confirmed" && new Date() < this.checkInDate;
};

// Method to check if booking can be cancelled
bookingSchema.methods.canBeCancelled = function() {
  if (this.bookingStatus === "cancelled" || this.bookingStatus === "completed") {
    return false;
  }
  // Allow cancellation up to 24 hours before check-in
  const hoursUntilCheckIn = (this.checkInDate.getTime() - Date.now()) / (1000 * 3600);
  return hoursUntilCheckIn > 24;
};

module.exports = mongoose.model("Booking", bookingSchema);
