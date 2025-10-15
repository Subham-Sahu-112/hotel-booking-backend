const cloudinary = require("../config/CloudinaryConfig");
const Hotel = require("../models/Hotel");

const createHotel = async (req, res) => {
  try {
    // Get vendor ID from authenticated request (if using vendor middleware)
    const vendorId = req.vendor?.vendorId || req.body.vendorId;
    
    // Parse JSON fields
    const basicInfo = JSON.parse(req.body.basicInfo || "{}");
    const contactInfo = JSON.parse(req.body.contactInfo || "{}");
    const amenities = JSON.parse(req.body.amenities || "[]");
    const roomTypes = JSON.parse(req.body.roomTypes || "[]");

    let mainImage = "";
    let additionalImages = [];

    // Helper function for uploading buffer to Cloudinary
    const uploadToCloudinary = (fileBuffer, folder) => {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder },
          (error, result) => {
            if (error) reject(error);
            else resolve(result.secure_url);
          }
        );
        uploadStream.end(fileBuffer);
      });
    };

    // Upload main image
    if (req.files && req.files.mainImage) {
      const file = req.files.mainImage[0];
      mainImage = await uploadToCloudinary(file.buffer, "HotelBookingApp");
    }

    // Upload additional images
    if (req.files && req.files.additionalImages) {
      const uploadPromises = req.files.additionalImages.map((file) =>
        uploadToCloudinary(file.buffer, "HotelBookingApp")
      );
      additionalImages = await Promise.all(uploadPromises);
    }

    // Create hotel document
    const hotel = new Hotel({
      vendor: vendorId || null, // Add vendor ID if available
      basicInfo,
      contactInfo,
      amenities,
      roomTypes,
      images: {
        mainImage,
        additionalImages,
      },
    });

    await hotel.save();
    res.status(201).json({ message: "Hotel created successfully", hotel });
  } catch (error) {
    console.error("Error saving hotel:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get hotel by ID
const getHotelById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find hotel by ID
    const hotel = await Hotel.findById(id);
    
    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }
    
    res.status(200).json({ hotel });
  } catch (error) {
    console.error("Error fetching hotel:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all hotels (if not already exists)
const getAllHotels = async (req, res) => {
  try {
    const hotels = await Hotel.find({});
    res.status(200).json(hotels);
  } catch (error) {
    console.error("Error fetching hotels:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update hotel by ID
const updateHotel = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Find and update hotel
    const updatedHotel = await Hotel.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedHotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }

    res.status(200).json({ 
      message: "Hotel updated successfully", 
      hotel: updatedHotel 
    });
  } catch (error) {
    console.error("Error updating hotel:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { createHotel, getHotelById, getAllHotels, updateHotel };
