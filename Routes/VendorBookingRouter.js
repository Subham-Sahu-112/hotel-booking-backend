const express = require("express");
const {
  getVendorBookings,
  getVendorDashboardStats
} = require("../Controllers/BookingController");
const vendorAuthMiddleware = require("../middleware/vendorAuthMiddleware");

const router = express.Router();

// All vendor booking routes require vendor authentication
router.use(vendorAuthMiddleware);

// Get dashboard statistics
router.get("/dashboard/stats", getVendorDashboardStats);

// Get all bookings for vendor's hotels
router.get("/", getVendorBookings);

module.exports = router;
