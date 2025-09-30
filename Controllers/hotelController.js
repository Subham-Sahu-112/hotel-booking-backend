const cloudinary = require("../config/CloudinaryConfig");
const Hotel = require("../models/Hotel");

const createHotel = async (req, res) => {
  try {
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

module.exports = { createHotel };
