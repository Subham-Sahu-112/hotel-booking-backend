const express = require("express");
const { createHotel, getHotelById, getAllHotels, updateHotel } = require("../Controllers/hotelController");
const upload = require("../config/MulterConfig")
const router = express.Router();

router.post(
  "/",
  upload.fields([
    { name: "mainImage", maxCount: 1 },
    { name: "additionalImages", maxCount: 10 },
  ]),
  createHotel
);

// Get all hotels
router.get("/all-hotels", getAllHotels);

// Get hotel by ID
router.get("/:id", getHotelById);

// Update hotel by ID
router.put("/:id", updateHotel);

module.exports = router;
