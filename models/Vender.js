const mongoose = require("mongoose");

const vendorSchema = new mongoose.Schema(
  {
    // Business Information
    businessName: { type: String, required: true },
    businessType: { type: String, required: true },
    businessDescription: { type: String },

    // Contact Information
    contactName: { type: String, required: true },
    emailAddress: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true },

    // Property Address
    streetAddress: { type: String },
    city: { type: String },
    country: { type: String },
    postalCode: { type: String },

    // Business Registration
    businessRegistrationNumber: { type: String },
    taxId: { type: String },

    // Account Setup
    password: { type: String, required: true },

    // Terms & Conditions
    acceptTerms: { type: Boolean, required: true },
    acceptPrivacy: { type: Boolean, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Vendor", vendorSchema);