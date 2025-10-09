const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    // Personal Information
    firstName: { 
      type: String, 
      required: true,
      trim: true 
    },
    lastName: { 
      type: String, 
      required: true,
      trim: true 
    },
    email: { 
      type: String, 
      required: true, 
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
    },
    phoneNumber: { 
      type: String, 
      required: true,
      trim: true 
    },
    dateOfBirth: { 
      type: Date, 
      required: true 
    },
    gender: { 
      type: String, 
      required: true,
      enum: ['Male', 'Female', 'Other', 'Prefer not to say']
    },
    
    // Address Information
    address: { 
      type: String, 
      required: true,
      trim: true 
    },
    city: { 
      type: String, 
      required: true,
      trim: true 
    },
    country: { 
      type: String, 
      required: true,
      trim: true 
    },
    postalCode: { 
      type: String, 
      required: true,
      trim: true 
    },
    
    // Account Setup
    password: { 
      type: String, 
      required: true,
      minlength: 8
    },
    
    // Preferences
    newsletter: { 
      type: Boolean, 
      default: false 
    },
    notifications: { 
      type: Boolean, 
      default: true 
    },
    
    // Terms & Conditions
    acceptTerms: { 
      type: Boolean, 
      required: true,
      validate: {
        validator: function(v) {
          return v === true;
        },
        message: 'Terms and Conditions must be accepted'
      }
    },
    acceptPrivacy: { 
      type: Boolean, 
      required: true,
      validate: {
        validator: function(v) {
          return v === true;
        },
        message: 'Privacy Policy must be accepted'
      }
    },

    // Account Status
    isActive: {
      type: Boolean,
      default: true
    },
    emailVerified: {
      type: Boolean,
      default: false
    },
    lastLogin: {
      type: Date
    }
  },
  { 
    timestamps: true,
    toJSON: {
      transform: function(doc, ret) {
        delete ret.password;
        return ret;
      }
    }
  }
);

// Index for better query performance
customerSchema.index({ email: 1 });
customerSchema.index({ phoneNumber: 1 });

// Virtual for full name
customerSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Method to check if customer is adult (18+)
customerSchema.methods.isAdult = function() {
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    return age - 1 >= 18;
  }
  return age >= 18;
};

module.exports = mongoose.model("Customer", customerSchema);