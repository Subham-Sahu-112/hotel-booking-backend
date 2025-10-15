const mongoose = require("mongoose");

const roomTypeSchema = new mongoose.Schema({
  roomType: { type: String, required: true },
  pricePerNight: { type: Number, required: true },
  maxGuests: { type: Number, required: true },
});

const hotelSchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: false // Make optional for backward compatibility with existing hotels
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: false // Make optional for backward compatibility
    },
    basicInfo: {
      hotelName: { type: String, required: true },
      description: { type: String },
      starRating: { type: Number, min: 1, max: 5 },
      address: { type: String, required: true },
      city: { type: String, required: true },
      country: { type: String, required: true },
    },
    contactInfo: {
      phone: { type: String, required: true },
      email: { type: String, required: true },
      checkInTime: { type: String },
      checkOutTime: { type: String },
    },
    amenities: [{ type: String }], // breakfast, parking, wifi, etc.
    images: {
      mainImage: { type: String }, // store file path or cloud URL
      additionalImages: [{ type: String }],
    },
    roomTypes: [roomTypeSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Hotel", hotelSchema);
