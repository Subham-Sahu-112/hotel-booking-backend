const express = require("express");
const {
  createBooking,
  getCustomerBookings,
  getBookingById,
  cancelBooking,
  updateBooking
} = require("../Controllers/BookingController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// All booking routes require authentication
router.use(authMiddleware);

// Create a new booking
router.post("/", createBooking);

// Get all bookings for the authenticated customer
router.get("/", getCustomerBookings);

// Get a specific booking by ID
router.get("/:id", getBookingById);

// Update a booking
router.put("/:id", updateBooking);

// Cancel a booking
router.post("/:id/cancel", cancelBooking);

module.exports = router;
